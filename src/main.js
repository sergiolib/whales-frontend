import '@fortawesome/fontawesome-free/css/all.css';
import Vue from 'vue';
import App from './App.vue';
import router from './router';
import Vuetify from 'vuetify';
import "vue-material-design-icons/styles.css";
import 'vuetify/dist/vuetify.min.css';
import GoogleAuth from 'vue-google-auth';
import { client_id } from './config';
import store from './store';
import VueClip from 'vue-clip';
Vue.use(VueClip);

Vue.use(GoogleAuth, { client_id: client_id });
Vue.googleAuth().load();

Vue.use(Vuetify);

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app');
