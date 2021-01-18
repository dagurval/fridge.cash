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

const app = require('express')();
const http = require('http').createServer(app);
const io = require("socket.io")(http, {
    cors: {
        origin: "http://localhost:8080",
        methods: ["GET", "POST"]
    }
});
const cors = require('cors')

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

async function main(): Promise<void> {
    const address = await privateKeyToP2PKH(
        Buffer.from(PRIVATE_KEY, 'hex'));

    log(chalk.green(`Fridge address is ${address}`));
    log('Connecting to electrum server...');
    await connect();
    log('.. connected!');

    let lastPriceUpdate = 0;
    let price: number | null = null;
    const fiat = CONVERSION_CURRENCY;
    const incomeObserver = new IncomeObserver(address);

    let balanceSatoshi = 0;
    let balanceFiat = 0;

    const MAINLOOP_SLEEP = 1000; // ms

    let busy = false;

    setInterval(async () => {
        if (busy) {
            return;
        }
        busy = true;
        try {
            [lastPriceUpdate, price]
                = await updateFiatPrice(lastPriceUpdate, price, fiat);

            [balanceSatoshi, balanceFiat]
                = await getFridgeBalance(balanceSatoshi, price, address);

            io.emit('price', { fiat, price });

            await incomeObserver.check(async (txid, sats) => {
                // Add hooks for income received here!
                const inFiat = `${round((sats / COIN) * price)} ${fiat}`;
                log(chalk.bgGreen(
                    `Received ${round(sats / COIN)} BCH (${inFiat}) from ${txid}`));
                io.emit('payment', { inFiat, txid, sats });
            });

            if (balanceFiat >= NEW_PURCHASE_THRESHOLD) {
                await sendOrder(price, fiat, address, PRIVATE_KEY);
                // Add hooks for order sent here!
            }
        } catch (e) {
            console.log(e);
        }
        busy = false;
    }, 2000, 'mainLoop');
}

main().then(console.log).catch(console.error);

app.use(cors());
app.get('/', (req, res) => {
  res.send('<h1>Hello world</h1>');
});

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('disconnect', () => {
      console.log('user disconnected');
  });
});

http.listen(3000, () => {
  console.log('listening on *:3000');
});
