<template>
  <div id="app">
    <v-ons-navigator swipeable swipe-target-width="200px"
                     :page-stack="pageStack"
                     :pop-page="goBack"
    ></v-ons-navigator>
  </div>
</template>
<script>
  import Vue from "vue";
  import moment from "moment";
  import locale from "@/js/locale";
  import {initialize} from "@/js/common";
  import config from "@/config";
  let GeTuiSdkPlugin = null;
  import router from "@/router";
  let io = require('socket.io-client');
  const options = {
    secure:true,
    reconnect: true,
    rejectUnauthorized:false,
  };
  let socket = io.connect(config.SOCKET_URL, options );
  Vue.prototype.$socket = socket;
  let filter2 = function (value) {
    let duration = moment.duration(moment().diff(value));
    let minutes = duration.asMinutes();
    if (minutes < 10)
      return locale.just_now;
    else if (minutes < 1440)
      return moment(value).format('HH:mm');
    else
      return moment(value).format('HH:mm M/D');
  };

  Vue.filter('timeline', filter2);
  let filter1 = function (text, length, clamp) {
    clamp = clamp || '...';
    let node = document.createElement('div');
    node.innerHTML = text;
    let content = node.textContent;
    return content.length > length ? content.slice(0, length) + clamp : content;
  };
  Vue.filter('truncate', filter1);
  Vue.filter('currency', function (value) {
    if (typeof value !== "number") {
      value = parseFloat(value)
    }
    var formatter = new Intl.NumberFormat('zh', {
      currency: 'CNY',
      minimumFractionDigits: 2
    });
    return formatter.format(value);
  });

  let pressBackBtn=0;
  let breakenPage = '';

  export default {
    name: 'app',

    data() {
      return {
        pageStack: [],
      }
    },
    methods: {
      /* Override default pop behavior and delegate it to the router */
      goBack() {
        // Go to the parent route component
        this.$router.push({ name: this.$route.matched[this.$route.matched.length - 2].name });

         //this.$router.go(-1); // Could work but might be misleading in some situations
      },
      init() {
       // this.$ons.notification.alert('text',{title:'通知',buttonLabel:'知道了'});
       // this.$ons.notification.confirm('',{title:locale.confirm_title,buttonLabels:[locale.confirm_cancel,locale.confirm_ok]})
      },
      handleBackBtn(event) {

        event.preventDefault();
        let pathName = this.$route.matched.length;
        if(pathName ===1) {
          if(breakenPage !== '' && breakenPage !== this.$route.name)
            pressBackBtn = 0;
          if(pressBackBtn === 0) {
            this.$ons.notification.toast('再安一次退出普泰维修',{timeout:500 });
            breakenPage = this.$route.name;
            pressBackBtn++;
          }
          else {
            pressBackBtn = 0;
            breakenPage = '';
            navigator.app.exitApp();
          }
        } else {
          this.$router.go(-1);
        }

      /* // this.$router.go(-1);
        this.$router.push({name:'home'})
        /!*if(new Date().getTime() - lastTimeBackPress < timePeriodToExit){
          alert('this closed');
          navigator.app.exitApp();
        } else {
          this.$ons.notification.toast('press again to exit app');
          lastTimeBackPress = new Date().getTime();

        }*!/*/
      },

    },
    created() {
      /* Define how routes should be mapped to the page stack.
       * This assumes all the routes contain VOnsPage components
       * and are provided in the 'default' view.
       * For nested named routes or routes that for some reason
       * should not be mapped in VOnsNavigator, filter them out here.
       */
      const mapRouteStack = route => this.pageStack = route.matched.map(m => m.components.default);

      /* Set initial pageStack depending on current
       * route instead of always pushing 'Home' page
       */
      mapRouteStack(this.$route);

      /* On route change, reset the pageStack to the next route */
      this.$router.beforeEach((to, from, next) => mapRouteStack(to) && next());

    },
    mounted() {
      let self = this;
      document.addEventListener("backbutton", function (e) {
        e.preventDefault();
        self.handleBackBtn(e);
        navigator.backButton.prevent();
      }, false);
    }
    
  }
  
</script>
