<template>
    <v-ons-page  v-bind:class="loading?'loading':''">
        <v-ons-toolbar class="navigate">
            <div class="left">
                <router-link :to="{path: '/my'}" class="btn">
                <i class="ion-chevron-left"></i>&nbsp;{{lang.back}}
                </router-link>
            </div>
            <div class="center text-center">
                <span>{{ lang.my_order }}</span>
            </div>
            <div class="right">
                <a href="#" @click="bindingType = true" class="btn"> <i class="ion-android-add-circle"></i>&nbsp;{{lang.add}}</a>
            </div>
        </v-ons-toolbar>
        <v-ons-tabbar swipeable position="top" class="order-tabbar"
                      :tabs="tabs"
                      :visible="true"
                      :tab-border="true"
                      :index.sync="activeIndex"
                      animation="none"
        >
        </v-ons-tabbar>
        <div class="position-fixed residence-wrapper d-flex flex-column" v-bind:class="bindingType?'active':''">
            <div class="flex-grow-1"></div>
            <div class="px-2 bg-white pb-5">
                <div class="d-flex justify-content-end pt-2 mb-3">
                    <span @click="bindingType = false" class="px-3 font-size-15em" ><i class="ion ion-android-close"></i> </span>
                </div>
                <div class=" w-100">
                    <button type="button" v-for="one in categories" class="btn btn-block btn-outline-success" @click="goLink(one.id)">{{ one.name}}</button>
                    <!-- <router-link v-for="one in categories" :to="{path: '/order-manage/null/' + one.id}" class="btn btn-block btn-outline-success">{{ one.name}}</router-link>-->
                </div>
            </div>
        </div>
    </v-ons-page>
</template>

<script>
    import locale from "@/js/locale";
    import orderWaitingTab from "@/pages/orderWaitingTab";
    import orderPendingTab from "@/pages/orderPendingTab";
    import orderCompletedTab from "@/pages/orderCompletedTab";
    import router from "@/router";
    export default {
        components: {orderWaitingTab, orderPendingTab, orderCompletedTab},
        props: {
            tabIndex: {
                default: 0
            }
        },
        data() {
            return {
                loading: false,
                activeIndex: 0,
                badgeWaiting:0,
                badgePending:0,
                badgeComplete:0,
                updatedOrder:0,
                bindingType:false,
                categories:[],
                tabs: [
                    {
                        icon: 'ion-android-alarm-clock',
                        label: locale.order_waiting,
                        page: orderWaitingTab,
                        value: 'waiting',
                    },
                    {
                        icon: 'ion-load-a',
                        label: locale.order_pending,
                        page: orderPendingTab,
                        value: 'pending'
                    },
                    {
                        icon: 'ion-bag',
                        label: locale.order_completed,
                        page: orderCompletedTab,
                        value: 'completed'
                    },
                ]
            }
        },
        methods: {
            gotoFilter() {
                router.push('/product-filter')
            },
            goLink(line) {
                this.bindingType = false;
                router.push('/order-manage/null/' + line);
            },
        },
        created() {
            this.lang = locale;
            let index  = this.$route.params.index
            this.activeIndex = parseInt(index);
            let categories = localStorage.getItem('category');
            this.categories = JSON.parse(categories);
        },
        /*watch:{
            'badgeWaiting':function (newVal) {
                this.tabs[0].badge = newVal
            },
            'badgePending':function (newVal) {
                this.tabs[1].badge = newVal
            },
            'badgeComplete':function (newVal) {
                this.tabs[2].badge = newVal
            },
        },*/

    }
</script>
