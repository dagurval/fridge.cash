import Vue from "vue";
import App from "./App.vue";
import "./registerServiceWorker";
import router from "./router";
import store from "./store";

/* eslint-disable-next-line */
const VueQrcode = require('@chenfengyuan/vue-qrcode');

Vue.config.productionTip = false;
Vue.component(VueQrcode.name, VueQrcode);

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");
