<template>
    <v-ons-page class="payment-page" v-bind:class="loading?'loading':''">
        <v-ons-toolbar class="navigate">
            <div class="left" @click="$emit('update:paymentProcessing',false)">
                <i class="ion-chevron-left"></i>&nbsp;{{lang.back}}
            </div>
            <div class="center">{{lang.take_order}}</div>
            <div class="right">
                &nbsp;
            </div>
        </v-ons-toolbar>
        <div class="content">
            <div class="d-flex flex-column h-100">
                <div class="address-wrapper py-3 px-2  position-relative bg-white d-flex align-items-center">
                    <span class="fa fa-map-marked-alt text-muted pl-2 pr-3"></span>
                    <div class="content flex-grow-1 d-flex flex-column ">
                        <label>
                            <span class=" font-weight-bold mr-2">{{params.name}}</span>
                            {{params.phone}}
                        </label>
                        <p class="font-size-13 mb-0">{{params.residence}} {{params.address}}</p>
                    </div>
                    <span class="pl-2 d-flex align-items-center" @click="changeAddress"><span class="font-size-13">{{lang.edit}}</span>  &nbsp;<i
                            class="ion-chevron-right"></i> </span>
                </div>
                <div class="product-wrapper d-flex mt-1 p-3 bg-white">
                    <div class="mr-2">
                        <img :src="item.main_photo">
                    </div>
                    <div class="d-flex flex-column align-content-between flex-grow-1 mr-2">
                        <div class="font-size-13 title">{{item.name | truncate(26, '...')}}</div>
                        <span class="text-muted font-size-12">
                            {{settings.model.sku}}
                        </span>
                        <div>
                            <span v-if="settings.required_service" class="badge badge-success font-size-12 px-2 py-1"><i
                                    class="ion-checkmark"></i> {{ lang.required_install_service}}</span>
                        </div>
                    </div>
                    <div>
                        <span class="amount">&yen;<b>{{ params.price | currency }}</b></span>
                    </div>
                </div>
                <div class="price-wrapper mt-1 p-3 bg-white">
                    <div class="d-flex mb-2 justify-content-between">
                        <span>{{lang.product_price}}</span>
                        <span class="amount">&yen;<b>{{ params.price | currency}}</b></span>
                    </div>
                    <div class="d-flex justify-content-between">
                        <span>{{lang.transfer_price}}</span>
                        <span class="amount">&yen;<b>{{ 0 | currency}}</b></span>
                    </div>
                    <hr>
                    <div class="d-flex justify-content-end">
                        <span class="mr-2">{{lang.total_price}}</span>
                        <span class="amount text-danger">&yen;<b>{{ params.price | currency}}</b></span>
                    </div>
                </div>
                <div class="paymethod-wrapper d-flex mt-1 p-3 bg-white">
                    <div class="d-flex align-items-center justify-content-between flex-grow-1">
                        <img :src="setting.ASSET_URL+'images/WePayLogo.png'">
                        <span class="fa fa-check"></span>
                    </div>
                </div>
                <div class="px-2 py-3">
                    <span class="text-muted font-size-12">@copyright 2021 {{lang.company_name}}</span>
                </div>
            </div>
            <div class="action-wrapper position-fixed d-flex bg-white">

                <div class="flex-grow-1 d-flex align-items-baseline justify-content-end mr-2">
                    <span class="font-size-13 mr-2">{{lang.pay_amount}}</span><span
                        class="price-amount"><small>&yen;</small>{{ params.price | currency }}</span>
                </div>
                <button type="button" class="payment-btn btn" @click="takingPayment">{{lang.pay_now}}</button>
            </div>

            <div class="position-absolute residence-wrapper d-flex flex-column"
                 v-bind:class="changingAddress?'active':''">
                <div class="flex-grow-1"></div>
                <div class="px-2 bg-white">
                    <div class="d-flex justify-content-between pt-2 mb-3">
                        <button @click="changingAddress = false" class="btn btn-outline-dark btn-sm px-3">
                            {{lang.cancel}}
                        </button>
                        <button @click="saveResidence" class="btn btn-outline-success btn-sm px-3">{{lang.decide}}
                        </button>
                    </div>
                    <div class="d-flex justify-content-between">
                        <scroll-picker :options="parentResidences" v-model="temp.province_id"></scroll-picker>
                        <scroll-picker :options="childResidences" v-model="temp.city_id"></scroll-picker>
                    </div>
                    <div class="form-group pb-3 pt-2">
                        <div class="input-group extra-field-clear position-relative">
                            <input class="form-control form-control-lg" v-model="temp.address">
                            <span v-if="temp.address !== ''" class="position-absolute text-danger "
                                  @click="temp.address = ''"><i
                                    class="fa fa-times-circle"></i> </span>
                        </div>

                    </div>

                </div>
            </div>
        </div>
    </v-ons-page>
</template>

<script>
    import Vue from "vue";
    import axios from 'axios';
    import config from "@/config";
    import constants from "@/js/constants";
    import locale from "@/js/locale";
    import router from "@/router";
    import {getResponseErrorMsg, deviceReady, requestSend, payViaWechat} from "@/js/common";
    import VueScrollPicker from "vue-scroll-picker";
    import "vue-scroll-picker/dist/style.css";

    Vue.use(VueScrollPicker);

    let self = null;
    export default {
        props: {
            item: {
                required: true,
            },
            settings: {
                required: true
            }
        },
        data() {
            return {
                loading: false,
                my: {},
                params: {
                    type: 'buy',
                    city_id: '',
                    province_id: '',
                    residence: '',
                    product_id: '',
                    address: '',
                    price: '',
                    content: '',
                    product_item_id: '',
                },
                changingAddress: false,
                temp: {
                    province_id: 0,
                    city_id: 0,
                    address: ''
                },
                residences: [],
                parentResidences: [],
                childResidences: [],
            }
        },
        created() {
            this.lang = locale;
            this.setting = config;
            const me = localStorage.getItem('me');
            if (me !== null && me !== '') {
                this.my = JSON.parse(me);
                this.params.province_id = this.my.province_id;
                this.params.city_id = this.my.city_id;
                this.params.address = this.my.address;
                this.params.name = this.my.name;
                this.params.product_id = this.item.id;
                this.params.price = parseFloat(this.settings.model.price);
                this.params.content = this.item.name;
                this.params.product_item_id = this.settings.model.id;
                this.params.type = this.settings.required_service ? 'install' : 'buy';
            } else
                router.push('/login');
            this.getResidence();
            this.params.residence = this.getResidenceName(this.my.province_id, this.my.city_id);
            self = this;
        },
        methods: {
            takingPayment() {
                let self = this;
                payViaWechat().then((weResp => {
                    if (weResp.status) {
                        let Wechat = weResp.obj;
                        self.loading = true;
                        requestSend(config.API_URL + 'weixin/order-create', this.params).then((resp => {
                            self.loading = false;
                            if (resp.status === constants.RES_SUCCESS) {
                                let data = resp.params;
                                let orderNo = data.order;
                                let params = {
                                    partnerid: data.partnerid,
                                    prepayid: data.prepayid,
                                    noncestr: data.noncestr, // nonce
                                    timestamp: data.timestamp, // timestamp
                                    sign: data.sign
                                };
                                Wechat.sendPaymentRequest(params, function (data) {
                                    self.loading = true;
                                    self.params.order = orderNo;
                                    requestSend(config.API_URL + 'order/create', self.params).then((resp => {
                                        if (resp.status === constants.RES_SUCCESS) {
                                            self.$socket.emit('order-sale', {user: self.my.id});
                                            router.push({name: 'my'})
                                        }
                                        self.loading = false
                                    }));
                                }, function (msg) {
                                    self.$ons.notification.alert(locale.payment_failed, {
                                        title: locale.alert_title,
                                        buttonLabel: locale.alert_ok
                                    });
                                })
                            }
                        }))
                    } else {
                        this.$ons.notification.alert(locale.weixin_not_support, {
                            title: locale.alert_title,
                            buttonLabel: locale.alert_ok
                        });
                    }
                }))
            },
            changeAddress() {
                this.temp.province_id = this.params.province_id;
                this.temp.city_id = this.params.city_id;
                this.temp.address = this.params.address;
                this.changingAddress = true
            },
            saveResidence() {
                this.params.province_id = this.temp.province_id;
                this.params.city_id = this.temp.city_id;
                this.params.residence = this.getResidenceName(this.params.province_id, this.params.city_id);
                this.params.address = this.temp.address;
                this.changingAddress = false;
            },
            getResidence() {
                const residence = localStorage.getItem('residence');
                if (residence === null) {
                    axios.post(config.API_URL + 'get-residence').then((resp) => {
                        resp = resp.data
                        this.residences = resp;
                        this.parentResidences = this.residences.map(function (val) {
                            return {'value': val.id, 'name': val.name}
                        });
                        localStorage.setItem('residence', JSON.stringify(resp))
                    }).catch(((error, resp) => {
                        this.$ons.notification.alert(locale.server_error, {
                            title: locale.alert_title,
                            buttonLabel: locale.alert_ok
                        });
                    }))
                } else
                    this.residences = JSON.parse(residence);
                this.parentResidences = this.residences.map(function (val) {
                    return {'value': val.id, 'name': val.name}
                });
            },
            getResidenceName(province, city) {
                let name = '';
                const parent = this.residences.filter(val => val.id === province);
                if (parent.length > 0) {
                    name += parent[0].name;
                    const child = parent[0].child.filter(val => val.id === city)
                    if (child.length > 0)
                        name += ' ' + child[0].name
                }
                return name;
            }
        },
        watch: {
            'temp.province_id': function (newVal) {
                const residence = this.residences.filter(val => val.id === newVal)
                if (residence.length > 0) {
                    this.childResidences = residence[0].child.map(function (val) {
                        return {'value': val.id, 'name': val.name}
                    })
                }
            }
        }
    }
</script>
