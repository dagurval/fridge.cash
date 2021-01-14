const util = require('util')
const chalk = require('chalk');
const bitcore = require('bitcore-lib-cash');

import { getUtxos } from './electrum';

const log = console.log;

export async function createTransaction(
    amount: number,
    destination: string,
    spendFromAddress: string,
    privateKeyBuffer: Uint8Array): Promise<string>
{
    // Ideally we should be using libauth for this, but it's interface
    // is rather painful.
    // TODO: Remove bitcore dependency and use libauth

    const utxos = await getUtxos(spendFromAddress) as any;
    const bn = bitcore.crypto.BN.fromBuffer(privateKeyBuffer);
    const privateKey = new bitcore.PrivateKey(bn);

    let inputAmount = 0;

    const spendFrom = bitcore.Address(spendFromAddress);

    const utxosBitcore = utxos.map((i) => {
        inputAmount += i.value;
        return {
            txId: i.tx_hash,
            outputIndex: i.tx_pos,
            address: spendFromAddress,
            script: new bitcore.Script(spendFrom).toHex(),
            satoshis: i.value,
        }
    });
    if (inputAmount < amount) {
        throw Error(`Not enough funds to create transaction (${inputAmount} < ${amount})`);
    }

    const tx = new bitcore.Transaction()
        .from(utxosBitcore)
        .addData("autonomous fridge.cash purchase!")
        .to(destination, amount)
        .change(spendFrom)
        .feePerKb(1000)
        .sign(privateKey);

    return tx.serialize();
};

