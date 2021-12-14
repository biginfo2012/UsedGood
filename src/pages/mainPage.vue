<template>
    <v-ons-page v-bind:class="loading?'loading':(type === 'home'?'hidden-top-bar':'')" >
        <v-ons-toolbar class="navigate" >
            <div class="left">&nbsp;</div>
            <div class="center text-center">
                <span v-if="type !== 'product'">{{ title }}</span>
                <div v-if="type === 'product'" class="filter-input">
                    <div class="position-relative" @click="gotoFilter">
                        <span class="position-absolute"><i class="ion-search"></i>&nbsp;{{lang.filter_product}}</span>
                    </div>
                </div>
            </div>
            <div class="right">&nbsp;</div>
        </v-ons-toolbar>
        <v-ons-tabbar position="bottom" class="main-tabbar"
                      :tabs="tabs"
                      :visible="true"
                      :index.sync="activeIndex"
                      :badge.sync="badge"
                      animation="none"
        >
        </v-ons-tabbar>
    </v-ons-page>
</template>

<script>
    import locale from "@/js/locale";
    import product from "@/pages/productTab";
    import home from "@/pages/homeTab";
    import notification from "@/pages/notificationTab";
    import my from "@/pages/myTab";
    import router from "@/router";


    export default {
        components: {home,product ,notification, my},
        props:{
          tabIndex:{
              default:0
          }
        },
        data() {
            return {
                loading: false,
                activeIndex: 0,
                firstAction:false,
                badge: '',
                tabs: [
                    {
                        icon: 'ion-home',
                        label: locale.home,
                        page: home,
                        value: 'home',
                    },
                    {
                        icon: 'ion-android-color-palette',
                        label: locale.product,
                        page: product,
                        value: 'product',
                    },
                    {
                        icon: 'ion-chatbox-working',
                        label: locale.notification,
                        badge: 0,
                        page: notification,
                        value: 'notify'
                    },
                    {
                        icon: 'ion-person',
                        label: locale.my,
                        page: my,
                        value: 'my',
                    }
                ],
                paths:[
                    {
                     value:'home',
                        path:'/',
                    },
                    {
                        value:'product',
                        path:'/product',
                    },
                    {
                        value:'notify',
                        path:'/notify',
                    },
                    {
                        value:'my',
                        path:'/my',
                    }
                ]
            }
        },
        methods: {
            gotoFilter() {
                router.push('/product-filter')
            },
            setActiveRoute() {

                if(this.paths[this.activeIndex].value !== this.$route.name && ['home','product','notify','my'].includes(this.$route.name)) {
                    router.push(this.paths[this.activeIndex].path)
                }
            },
        },
        computed: {
            title() {
                return this.tabs[this.activeIndex].label;
            },
            type() {
                return this.tabs[this.activeIndex].value;
            },
        },
        created() {
            this.lang = locale;
            this.tabs[2].badge = this.badge;
            this.activeIndex = this.$route.meta.index;
            this.firstAction = true;
        },
        watch:{
            'badge':function (newVal) {
                this.tabs[2].badge = newVal
            },
            'activeIndex':function (newVal) {
                this.setActiveRoute()
            }
        },
      

    }
</script>
