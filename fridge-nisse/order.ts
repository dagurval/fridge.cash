import { round } from './util';
import { createTransaction } from './transaction';
import {
    COIN,
    MERCHANT_DESTINATION_ADDRESS,
    NEW_PURCHASE_THRESHOLD,
} from './config';

import { broadcast } from './electrum';
const log = console.log;
const sleep = require('sleep');
const chalk = require('chalk');

export async function sendOrder(
    fiatPrice: number, fiat: string,
    fridgeAddress: string, fridgePrivateKey): Promise<void>
{
    log(chalk.bgGreen("We can afford new refreshments!!"));
    let bch_cost = NEW_PURCHASE_THRESHOLD / fiatPrice;
    log(chalk.green(
        `Sending ${round(bch_cost)} BCH `
        + `(${round(NEW_PURCHASE_THRESHOLD)} ${fiat}) `
        + `to ${MERCHANT_DESTINATION_ADDRESS}`));

        const tx = await createTransaction(
            Math.ceil(bch_cost * COIN),
            MERCHANT_DESTINATION_ADDRESS,
            fridgeAddress,
            Buffer.from(fridgePrivateKey, 'hex'));

        const txid = await broadcast(tx);
        const receipt = 'https://receipt.bitcoincash.network/#/tx';
        log(chalk.bgGreen(`Transaction sent: ${receipt}/${txid}`));

        // TODO: Send e-mail with order and payment receipt!

        // Allow transaction to propagate before checking our balance again.
        sleep.msleep(5000);


}
