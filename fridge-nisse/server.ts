const chalk = require('chalk');
import { round } from './util';
import { privateKeyToP2PKH, generatePrivateKey } from './address';
import {
    COIN,
    CONVERSION_CURRENCY,
    CONVERSION_UPDATE_INTERVAL,
    NEW_PURCHASE_THRESHOLD,
    PRIVATE_KEY,
} from './config';
import {
    connect,
    disconnect,
    getBalance,
} from './electrum';
import { sendOrder } from './order';
import { IncomeObserver } from './incomeobserver';

const log = console.log;
const util = require('util')
const sleep = require('sleep');
const CoinGecko = require('coingecko-api');

if (PRIVATE_KEY === null) {
    log(chalk.red(
        'PRIVATE_KEY is not set. Generating a private key and exiting.'
    ));
    log("Here's a random private key: ",
        Buffer.from(generatePrivateKey()).toString('hex'));

    log('Update config.ts if you want to use this key.');
    process.exit(1);
}

function getTime(): number {
    return Math.floor(Date.now() / 1000);
}

async function getPrice(): Promise<number> {
    const gecko = new CoinGecko();
    let response = await gecko.simple.price({
        ids: ['bitcoin-cash'],
        vs_currencies: [CONVERSION_CURRENCY]
    });
    return response.data['bitcoin-cash'].nok;
}

async function updateFiatPrice(lastPriceUpdate: number,
                               lastPrice: number, fiat: string) {
    const now = getTime();

    if (now - lastPriceUpdate < CONVERSION_UPDATE_INTERVAL) {
        return [lastPriceUpdate, lastPrice];
    }
    log(chalk.yellow(`Fetching price of ${fiat}/BCH...`));
    const price = await getPrice();
    log(chalk.yellow(`1 BCH = ${price} ${fiat}`));
    return [getTime(), price];
}

async function getFridgeBalance(lastBalanceSats: number, price: number, address: string) {
    const r = await getBalance(address) as any;
    const balanceSatoshi = r.confirmed + r.unconfirmed;
    const balanceFiat = (balanceSatoshi / COIN) * price as number;

    if (lastBalanceSats !== balanceSatoshi) {
        log(chalk.green(
            `Balance on address is ${round(balanceSatoshi / COIN)} BCH `
                    + `(${round(balanceFiat)} ${CONVERSION_CURRENCY})`));
    }
    return [balanceSatoshi, balanceFiat];
}

async function mainLoop(address: string): Promise<void> {
    let lastPriceUpdate = 0;
    let price: number | null = null;
    const fiat = CONVERSION_CURRENCY;
    const incomeObserver = new IncomeObserver();

    let balanceSatoshi = 0;
    let balanceFiat = 0;

    const MAINLOOP_SLEEP = 5000; // ms

    while (true) {
        [lastPriceUpdate, price]
            = await updateFiatPrice(lastPriceUpdate, price, fiat);

        [balanceSatoshi, balanceFiat]
            = await getFridgeBalance(balanceSatoshi, price, address);

        if (balanceFiat >= NEW_PURCHASE_THRESHOLD) {
            await sendOrder(price, fiat, address, PRIVATE_KEY);
        }
        sleep.msleep(MAINLOOP_SLEEP);
    }
}

async function main() {
    const fridgeAddress = await privateKeyToP2PKH(
        Buffer.from(PRIVATE_KEY, 'hex'));

    log(chalk.green(`Fridge address is ${fridgeAddress}`));
    log('Connecting to electrum server...');
    await connect();
    log('.. connected!');

    try {
        await mainLoop(fridgeAddress);
    }
    finally {
        disconnect();
    }
    return "Done";
}

main().then(console.log).catch(console.error);

