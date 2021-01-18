const FRIDGE_PATH = 'fridge.json';
const fs = require('fs');
const util = require('util');
const log = console.log;
const assert = require('assert');
import { NEW_PURCHASE_THRESHOLD } from './config';

function loadFridgeState() {
    if (!fs.existsSync(FRIDGE_PATH)) {
        log(`File ${FRIDGE_PATH} did not exist. Creating.`);
        saveFridgeState({
            soldUnits: 0,
            numberOfSlots: 24,
            slotBalance: 0,
            orderPriceNok: NEW_PURCHASE_THRESHOLD,
        });
        return loadFridgeState();
    }
    const rawdata = fs.readFileSync(FRIDGE_PATH);
    const state = JSON.parse(rawdata);
    assert(state !== undefined);
    return state;
}

function saveFridgeState(state) {
    let data = JSON.stringify(state);
    fs.writeFileSync(FRIDGE_PATH, data);
}

export class FridgeState {
    state: any;

    constructor() {
        this.state = loadFridgeState();
        this.state.orderPriceNok = NEW_PURCHASE_THRESHOLD;
        log(`Loaded fridge state ${util.inspect(this.state)}.`);
    }

    onPaymentReceived(income: number) {
        this.state.soldUnits += 1;
        this.state.slotBalance += income;
    }

    flush() {
        saveFridgeState(this.state);
    }

    get() {
        return this.state;
    }
}
