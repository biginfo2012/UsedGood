// Webpack CSS import
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

import 'onsenui/css/onsenui.css';
import 'onsenui/css/onsen-css-components.css';
import 'sass/theme.scss';
// JS import
import Vue from 'vue';
import {BootstrapVue, IconsPlugin} from 'bootstrap-vue'
import VueOnsen from 'vue-onsenui'; // This already imports 'onsenui'
import ons from 'onsenui';

import router from "@/router";
import App from './App.vue';
import store from "@/store";

if (ons.platform.isIPhoneX()) {
    document.documentElement.setAttribute('onsflag-iphonex-portrait', '');
    document.documentElement.setAttribute('onsflag-iphonex-landscape', '');
}

Vue.use(VueOnsen);

var vueApp = new Vue({
    el: '#app',
    router,
    store,
    template: '<app></app>',
    components: {App},
});
