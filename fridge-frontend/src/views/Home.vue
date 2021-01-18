<template>
  <div class="home">
    <h1 style="color: #5dcb79">Purchase Club Mate</h1>
    <div v-if="getAddress.length == 0">
        <h1 style="color: red;">Fridge is booting ...</h1>
    </div>
    <div v-else>
    <div v-if="getPaymentReceived != ''" style="position: absolute; top: 100px;
        left: 50%; margin-left: -300px; width: 600px;
         background-color: #1b1b1b; min-height: 400px;">
        <h1 style="color: white;">{{ getPaymentReceived }}</h1>
        <img src="https://j.gifs.com/yoqG4g.gif"/>
    </div>
    <qrcode v-bind:value="getQrString"
        :options="qrCodeOptions"></qrcode>
    <h2 style="color: white; margin-top: -1.0em;" >
        Price {{ fiatPriceHuman }} NOK <span style="font-size: 80%">
        ({{ bchPriceHuman }} BCH)</span></h2>
        <h4 style="margin-top: 0.5em; color: #efefef;">Units left in fridge {{ remainingUnits }} 🥤.</h4>
        <h4 style="color: #efefef;">Fridge balance {{ nokBalance | roundFiat }} NOK, refill at  {{ nokNeeded | roundFiat }} NOK.</h4>
</div>
</div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

Vue.filter('roundFiat', function (value: number) {
    return Math.round(value * 100) / 100;
});

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

  get getPaymentReceived() {
    return this.$store.state.paymentReceived
  }
}
</script>
