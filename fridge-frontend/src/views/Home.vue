<template>
  <div class="home">
    <h1 style="color: #5dcb79">Purchase Club Mate</h1>
    <qrcode v-bind:value="getQrString"
        :options="qrCodeOptions"></qrcode>
    <h2 style="color: white; margin-top: -1.0em;" >
        Price {{ fiatPriceHuman }} NOK <span style="font-size: 80%">
        ({{ bchPriceHuman }} BCH)</span></h2>
<div style="font-size: 80%; max-width: 20em;">
<p>
    Debug info:
        Price {{bchPrice}},
        Balance {{bchBalance}},
        BalanceNok {{nokBalance}},
        needed brfore buy {{nokNeeded}},
        Units left: {{remainingUnits}},
</p>
</div>


    <button v-on:click='setNewBalance'>asdasd</button>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

export default class Home extends Vue {

  private qrCodeOptions = {
    width: 500,
    color: { dark: '#5dcb79', light: '#00000000' }
  };

  setNewBalance = () => {
    this.$store.commit('setBchBalance', {balance:0.01})
  }

  get bchPrice() {
    return this.$store.getters.bchUnitPrice
  }

  get bchPriceHuman() {
    return Math.round(this.$store.getters.bchUnitPrice * 1000000) / 1000000;
  }

  get fiatPriceHuman() {
    return Math.round(
        (this.$store.getters.bchUnitPrice * this.$store.state.bchNokPrice) * 100) / 100;
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
