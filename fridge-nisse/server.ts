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


async function mainLoop(address: string): Promise<void> { let lastPriceUpdate = 0;
    let price: number | null = null;
    const fiat = CONVERSION_CURRENCY;

    while (true) {
        if (getTime() - lastPriceUpdate >= CONVERSION_UPDATE_INTERVAL) {
            log(chalk.yellow(`Fetching price of ${fiat}/BCH...`));
            lastPriceUpdate = getTime();
            price = await getPrice();
            log(chalk.green(`1 BCH = ${price} ${fiat}`));
        }
        const r = await getBalance(address) as any;
        const balance_satoshi = r.confirmed + r.unconfirmed;
        const balance_fiat = (balance_satoshi / COIN) * price as number;
        log(chalk.green(`Balance on address is ${round(balance_satoshi / COIN)} BCH `
            + `(${round(balance_fiat)} ${CONVERSION_CURRENCY})`));
        sleep.msleep(5000);

        if (balance_fiat >= NEW_PURCHASE_THRESHOLD) {
            await sendOrder(price, fiat, address, PRIVATE_KEY);
        }
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

