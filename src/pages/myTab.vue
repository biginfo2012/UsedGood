<template>
    <v-ons-page class=" bg-1 my-page" v-bind:class="loading?'loading':''">
        <div class="h-100 d-flex flex-column">
            <div class="profile-wrapper bg-white d-flex align-items-center">
                <img class="mr-2" :src="myInfo.avatar" @error="setAltImg"/>
                <div class=" d-flex flex-column flex-grow-1">
                    <span class="name">{{myInfo.name}}</span>
                    <span class="phone text-muted">{{myInfo.phone}}</span>
                </div>
                <div>
                    <router-link class="text-muted" :to="{path: '/profile'}">{{lang.edit}}&nbsp;<span class="ion-chevron-right text-dark pl-2"></span>
                    </router-link>
                </div>
            </div>
            <div class="device-wrapper bg-white d-flex flex-column" v-if="false">
                <h4 class="font-weight-bold"><i class="fa fa-wrench"></i>&nbsp; {{ lang.my_device}}</h4>
                <div v-if="myInfo.device">

                </div>
                <div v-else class="w-100 d-flex flex-column align-items-center">
                    <div class="separator dark w-75 my-3">{{ lang.no_have_my_device_info}}</div>
                    <div class="button-group d-flex align-items-center mb-4">
                        <button class="btn btn-success btn-square" @click="goSale">{{ lang.buy_product}}</button>
                        <div class="wall"></div>
                        <button class="btn btn-success btn-square">{{ lang.register_my_device}}</button>
                    </div>
                </div>
            </div>
            <div class="order-wrapper bg-white">
                <div class="d-flex justify-content-between align-items-center">
                    <h4 class="font-weight-bold "><i class="fa fa-shopping-cart"></i>&nbsp; {{ lang.my_order}}</h4>
                    <router-link :to="{path: '/order/0'}" class="text-muted">{{ lang.manage}}&nbsp;<i class="ion-chevron-right pl-2"></i> </router-link>
                </div>

                <!--<div class="d-flex align-items-center justify-content-around">
                    <div class="item position-relative" v-for="tab in orderTabs" @click="goOrderPage(tab.value)">
                        <span class="icon" :class="tab.icon"></span>
                        <span class="label">{{tab.label}}</span>
                        <span v-if="orderCounts[tab.value] > 0" class="badge position-absolute badge-danger">{{orderCounts[tab.value]}}</span>
                    </div>
                </div>
                <div class="position-relative flex-grow-1">

                </div>-->
            </div>
        </div>
    </v-ons-page>
</template>
<script>
    import config from "@/config";
    import {requestSend} from "@/js/common";
    import constants from "@/js/constants";
    import router from "@/router";
    import locale from "@/js/locale";
    let self;
    export default {
        data() {
            return {
                loading: false,
                page: 0,
                myInfo: {},
                totalCount: 0,
                updatedProfile: false,
                orderActiveIndex: 'waiting',
                orderCounts:[0,0,0],
                orderTabs: [
                    {
                        icon: 'ion-android-alarm-clock',
                        label: locale.order_waiting,
                        value: 0,
                        badge: 0
                    },
                    {
                        icon: 'ion-load-a',
                        label: locale.order_pending,
                        badge: 0,
                        value: 1
                    },
                    {
                        icon: 'ion-bag',
                        label: locale.order_completed,
                        badge: 0,
                        value: 2
                    },
                ]
            }
        },
        methods: {
            getList() {
                const me = localStorage.getItem('me')
                if (me !== null && me !== '')
                    this.myInfo = JSON.parse(me)
                else
                    //router.push('/login')
                if (this.myInfo.avatar === null)
                    this.myInfo.avatar = constants.ERR_SRC
                // this.getCountInfo();
            },
            getCountInfo() {
                alert('this count info');
                requestSend(config.API_URL + 'order/count',{},constants.METHOD_GET).then(data => {
                    this.orderCounts = data;
                });
            },
            setAltImg(event) {
                event.target.src = constants.ERR_SRC
            },
            goSale() {
                this.$emit('update:index', 1)
            },
            goOrderPage(value) {
                router.push('/order/' + value);
            }
        },
        created() {
            this.lang = locale
            this.getList()
            self = this;
            /*this.$socket.on('user-order-changed', data => {
                alert(data.type + ":" + data.user + ":" + this.my.id);
                if ((data.type === 'order_accepted' || data.type === 'order_got') && data.user === this.my.id) {
                    this.getCountInfo()
                }
            });
            this.$socket.on('user-notify',data => {
                alert(data.type + ":" + data.user + ":" + this.my.id);
                if ((data.type === 'order_cancelled' || data.type === 'order_created' || data.type === 'order_completed') && data.user === this.my.id) {
                    this.getCountInfo()
                }
            });*/
        },
    }
</script>
