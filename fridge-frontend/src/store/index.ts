import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    bchNokPrice: 4213.37,
    numberOfSlots: 24,
    orderPriceNok: 600,
    bchBalance: 0.011866985334779525,
    soldUnits: 2,
    profit: 0.1
  },
  getters: {
    bchUnitPrice: state => {
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
    },
    remainingUnits: state => {
      return state.numberOfSlots-state.soldUnits
    },
    getNokBalance: state => {
      return state.bchBalance*state.bchNokPrice
    },
    nokNeeded: state => {
      return state.orderPriceNok - (state.bchBalance*state.bchNokPrice)
    }
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
      state.bchBalance = price
    },
    loadFridge(state, payload:{unitCount:number}){
      const {unitCount} = payload
      state.numberOfSlots = state.numberOfSlots - state.soldUnits + unitCount
      state.soldUnits = 0
    },
  },
  actions: {},
  modules: {}
});
