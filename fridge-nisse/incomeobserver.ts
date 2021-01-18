const fs = require('fs');
const chalk = require('chalk');
const util = require('util');
const assert = require('assert');

const HISTORY_PATH = 'history.json';

import { getHistory, getTransaction } from './electrum';

const log = console.log;
/**
 * History structure holds track of what transactions have been processed.
 * {
 *      txid: { }
 *      txid: { }
 *      ...
 * }
 */

function loadHistory() {
    if (!fs.existsSync(HISTORY_PATH)) {
        log(`File ${HISTORY_PATH} did not exist. Creating.`);
        saveHistory({});
        return loadHistory();
    }
    const rawdata = fs.readFileSync(HISTORY_PATH);
    const history = JSON.parse(rawdata);
    assert(history !== undefined);
    return history;
}

function saveHistory(history) {
    let data = JSON.stringify(history);
    fs.writeFileSync('history.json', data);
}

/**
 * Observes transaction to fridge address and accumilates sends events
 * on new coins.
 */
export class IncomeObserver {

    history: any;
    address: string;

    constructor(address: string) {
        this.history = loadHistory();
        this.address = address;
        log(`Loaded ${Object.keys(this.history).length} historical transactions`);
    }

    flush() {
        saveHistory(this.history);
    }

    fetchIncomeFromTx(ourAddress, tx) {
        let income = 0;
        for (const out of tx.vout) {
            if (!out.scriptPubKey.addresses.length) {
                // OP_DATA ??
                continue;
            }
            const toAddr = out.scriptPubKey.addresses[0];
            if (toAddr != ourAddress) {
                continue;
            }
            income += out.value_satoshi;
        }
        return income ? income : null;
    }

    async check(onIncome: any): Promise<void> {
        const response = await getHistory(this.address) as any;

        let unprocessed = [];

        response.forEach((tx) => {
            if (this.history[tx.tx_hash] === undefined) {
                unprocessed.push(tx.tx_hash);
            }
        }, this);

        // TODO: Processing could be done in parallel. Transaction order
        // does not matter.
        for (let txid of unprocessed) {
            let tx = null;
            try {
                tx = await getTransaction(txid, true);
            } catch (e) {
                log(chalk.red(`Failed load transaction ${txid}`));
                continue;
            }
            const income = this.fetchIncomeFromTx(this.address, tx);
            if (income === null) {
                // This is a transaction that *spends* from address.
                // It contains no income.
                this.history[txid] = { };
                continue;
            }
            try {
                await onIncome(txid, income);
            }
            catch (e) {
                log(chalk.red(`onIncome callback failed ${e}`))
            }
            this.history[txid] = { };
            log(`Flushing ${Object.keys(this.history).length} transactions.`);
            this.flush();
        }
    }

    ignoreTx(txid: string) {
        this.history[txid] = { };
        this.flush();
    }
}
