import Vue from "vue";
import Vuex from "vuex";
/* eslint-disable-next-line */
const util = require('util');

Vue.use(Vuex);

/* eslint-disable-next-line */
function calculateUnitPrice(state: any) {
    const {
        bchNokPrice,
        numberOfSlots,
        orderPriceNok,
        bchBalance,
        soldUnits,
        profit
    } = state

    const nokBalance = bchNokPrice * bchBalance
    const priceNok = ((orderPriceNok - nokBalance) / (numberOfSlots - soldUnits) ) * (1 + profit)

    return priceNok/bchNokPrice
}

export default new Vuex.Store({
  state: {
    bchNokPrice: 0,
    numberOfSlots: 0,
    orderPriceNok: 0,
    bchBalance: 0.0,
    soldUnits: 0,
    profit: 0.1,
    fridgeAddress: "",
    paymentReceived: "",
    showSpinner: false,
    showRefill: "",
  },
  getters: {
    bchUnitPrice: state => {
      return calculateUnitPrice(state);
    },
    remainingUnits: state => {
      return state.numberOfSlots-state.soldUnits
    },
    getNokBalance: state => {
      return state.bchBalance*state.bchNokPrice
    },
    nokNeeded: state => {
      return state.orderPriceNok - (state.bchBalance*state.bchNokPrice)
    },
    qrString: state => {
      return `${state.fridgeAddress}?amount=${calculateUnitPrice(state)}`
    },
  },
  mutations: {
    unitSold (state) {
      state.soldUnits++
    },
    setBchBalance (state, payload:{balance:number}){
      console.log(payload)
      const {balance} = payload
      state.bchBalance = balance
    },
    setBchNokPrice(state, payload:{price:number}) {
      const { price } = payload
      state.bchNokPrice = price
    },
    loadFridge(state, payload:{unitCount:number}){
      const {unitCount} = payload
      state.numberOfSlots = state.numberOfSlots - state.soldUnits + unitCount
      state.soldUnits = 0
    },
    paymentReceived(state, payload: any) {
        if (payload === null) {
            state.paymentReceived = "";
            return;
        }
        state.paymentReceived = `Payment of ${payload.bch} BCH (${payload.inFiat} NOK) received!`;
    },
    serverFridgeUpdate(state, payload: any) {
        // TODO: We should use satoshis internally.
        console.log(`Fridge state update ${util.inspect(payload)}`);
        state.bchBalance = payload.slotBalance / 100000000;
        state.soldUnits = payload.soldUnits;
        state.numberOfSlots = payload.numberOfSlots;
        state.orderPriceNok = payload.orderPriceNok;
        state.fridgeAddress = payload.fridgeAddress;
    },

    setShowSpinner(state, payload: boolean) {
        state.showSpinner = payload;
    },
    setShowRefill(state, txid: string) {
        state.showRefill = txid;
    },
  },
  actions: {},
  modules: {}
});
