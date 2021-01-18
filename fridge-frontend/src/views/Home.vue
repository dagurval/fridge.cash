<template>
  <div class="home">
    <qrcode v-bind:value="getQrString" :options="{ width: 400 }"></qrcode>
    <h3>Price {{bchPrice}}</h3>
    <h3>Balance {{bchBalance}}</h3>
    <h3>BalanceNok {{nokBalance}}</h3>
    <h3>needed brfore buy {{nokNeeded}}</h3>
    <h3>Units left: {{remainingUnits}}</h3>
    <h3>{{getQrString}}</h3>

    <button v-on:click='setNewBalance'>asdasd</button>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

export default class Home extends Vue {

  setNewBalance = () => {
    this.$store.commit('setBchBalance', {balance:0.01})
  }

  get bchPrice() {
    return this.$store.getters.bchUnitPrice
  }
  get bchBalance() {
    return this.$store.state.bchBalance
  }
  get nokBalance() {
    return this.$store.getters.getNokBalance
  }
  get remainingUnits() {
    return this.$store.getters.remainingUnits
  }
  get nokNeeded() {
    return this.$store.getters.nokNeeded
  }
  get getAddress() {
    return this.$store.state.fridgeAddress
  }
  get getQrString() {
    return this.$store.getters.qrString
  }
}
</script>
