import Vue from "vue";
import App from "./App.vue";
import "./registerServiceWorker";
import router from "./router";
import store from "./store";
import { BootstrapVue } from 'bootstrap-vue'

import './app.scss'

/* eslint-disable-next-line */
const io = require("socket.io-client");
const socket = io("http://localhost:3000", {
    withCredentials: false,
    extraHeaders: {
        "my-custom-header": "abcd"
    }
});

socket.on('price', (stuff: any) => {
    console.log(stuff);
    store.commit('setBchNokPrice', {
        price: stuff.price
    });
});

/* eslint-disable-next-line */
const VueQrcode = require('@chenfengyuan/vue-qrcode');

Vue.config.productionTip = false;
Vue.component(VueQrcode.name, VueQrcode);
Vue.use(BootstrapVue)

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");
