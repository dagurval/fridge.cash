import Vue from "vue";
import Vuex from "vuex";

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
    bchNokPrice: 4213.37,
    numberOfSlots: 24,
    orderPriceNok: 600,
    bchBalance: 0.0,
    soldUnits: 0,
    profit: 0.1,
    fridgeAddress: "bitcoincash:qrsa5cfu9scd22yy6fq6854sg2txpvqpxu9w45ry8e",
    paymentReceived: ""
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
        state.bchBalance += payload.bch;
        state.soldUnits += 1;
        state.paymentReceived = `Payment of ${payload.bch} (${payload.inFiat} NOK) received!`;
    }
  },
  actions: {},
  modules: {}
});
