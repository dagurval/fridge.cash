const fs = require('fs');
const HISTORY_PATH = 'history.json';

const log = console.log;
/**
 * History structure holds track of what transactions have been processed.
 * {
 *      txid: {
 *          value: 1
 *      },
 *      txid: {
 *          value: 1
 *      },
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

    constructor() {
        this.history = loadHistory();
    }

    flush() {
        saveHistory(this.history);
    }
}
