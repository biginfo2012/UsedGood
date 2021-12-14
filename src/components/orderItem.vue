<template>
    <div>
        <div v-if="item.status !== undefined" class="order-item" @click="goDetail" :class="item.status">
            <div class="order-wrapper mb-2 d-flex justify-content-between">
                <span class="no text-muted">{{lang.order_no}}&nbsp;#<b>{{item.no}}</b></span>
                <span class="badge" :class="item.status !== 'cancelled'?'text-success':'text-danger'">{{lang['order_'+item.status]}}</span>
            </div>
            <div class="d-flex">
                <div class="image-wrapper">
                    <div class="icon-wrapper repair"  v-if="item.product === null">
                        <span class="fa fa-recycle"></span>
                    </div>
                    <img v-else-if="item.product !== null" :src="item.product.main_photo">
                </div>
                <div class="cont pb-1 d-flex flex-column flex-grow-1 justify-content-between">
                    <div>
                        <span v-if="item.type === 'buy'" class="price-amount text-danger ml-3">
                            <small>&yen;</small><b >{{ item.model.price | currency }}</b>
                        </span>
                        <span v-else-if="item.type === 'install'" class="price-amount text-danger ml-3">
                            <small>&yen;</small><b>{{ item.model.price | currency }}</b>
                             + <b v-if="item.price !== null">{{ item.price | currency }}</b><b v-else>服务费</b>
                            <i v-if="item.paid_status === 'paid'" class="ion-checkmark-round text-success font-size-12" style="vertical-align: top"></i>
                        </span>
                        <span v-else-if="item.price != null" class="price-amount text-danger ml-3">
                            <small>&yen;</small>
                            <b>{{ item.price | currency }}</b>
                            <i v-if="item.paid_status === 'paid'" class="ion-checkmark-round text-success font-size-12" style="vertical-align: top"></i>
                        </span>
                    </div>
                    <div class="worker-wrapper py-1" v-if="item.manager!= null">
                        <span class="font-size-12">{{lang.manager}}: </span>
                        <img class="avatar" :src="item.manager.avatar === null?'e':item.manager.avatar"
                             @error="setAltImg"/>
                        <span class="name">{{item.manager.name}}</span>
                        <span class="contact ml-3 text-primary"><i class="fa fa-mobile"></i>&nbsp; {{item.manager.phone}}</span>
                    </div>
                    <div class="font-size-12">
                        <span class="fa fa-map-marked-alt text-muted mr-2"> </span><span>{{item.residence}} &nbsp;{{item.address}}</span>
                    </div>
                    <div class="header d-flex justify-content-between">
                        <p class="title mb-0">{{item.content | truncate(24,'...')}}<br><small v-if="item.model != null">{{item.model.sku}}</small></p>
                        <span class="timeline text-muted">{{item.updated_at | timeline}}</span>
                    </div>
                </div>
            </div>
            <div class="text-right actions pt-1">
                <button @click.stop="cancelItem"
                        v-if="!(item.type==='buy' || item.type === 'install') && item.status === 'waiting'"
                        class="btn btn-light btn-sm">{{lang.cancel}}
                </button>
                <button @click.stop="gotItem"
                        v-if="item.status === 'pending'&&(item.type==='buy')"
                        class="btn btn-light btn-sm">
                    {{lang.got_product}}
                </button>
                <button @click.stop="ratingItem" v-if="item.status==='completed' && item.rating == null"
                        class="btn btn-success btn-sm">
                    {{lang.rating_now}}
                </button>
                <!--<button @click.stop="payItem" v-if="item.price != null&&item.paid_status === 'not_paid'&& item.type !== 'buy'"
                        class="btn btn-danger btn-sm">
                    {{lang.pay_now}}
                </button>-->
                <button @click.stop="removeItem"
                        v-if="item.status === 'cancelled' || (item.status==='completed' && item.rating != null)"
                        class="btn btn-danger btn-sm">
                    {{lang.remove}}
                </button>
                <button @click.stop="completeItem" v-if="item.status === 'pending' && item.price != null && item.type !== 'buy'" class="btn btn-success btn-sm">
                    {{lang.complete}}
                </button>
            </div>
        </div>
        <div v-else class="order-item temp">
            <div class="order-wrapper mb-2 d-flex justify-content-between">
                <span class="no text-muted">&nbsp;&nbsp;</span>
                <span class="badge" >&nbsp;&nbsp;</span>
            </div>
            <div class="d-flex">
                <div class="image-wrapper">
                    <div class="icon-wrapper bg-light" >

                    </div>
                </div>
                <div class="cont pb-1 d-flex flex-column flex-grow-1 justify-content-between">
                    <div class="header d-flex justify-content-between">
                        <p class="title mb-0">&nbsp;</p>
                        <span class="timeline text-muted">&nbsp;</span>
                    </div>
                    <div>
                        <span class="badge badge-light px-3" >&nbsp;</span>
                        <span  class="price-amount text-danger ml-3">
                            &nbsp;
                        </span>
                    </div>
                    <div class="font-size-12">
                        <span>&nbsp;&nbsp;</span>
                    </div>
                </div>
            </div>
            <div class="text-right actions pt-1">
                &nbsp;&nbsp;
            </div>
        </div>
    </div>
</template>

<script>
    import Vue from "vue";
    import axios from 'axios';
    import config from "@/config";
    import constants from "@/js/constants";
    import locale from "@/js/locale";
    import router from "@/router";
    import {getResponseErrorMsg, deviceReady, requestSend, payViaWechat} from "@/js/common";

    let self = null;

    export default {
        props: {
            item: {
                required: true,
            }
        },
        data() {
            return {
                loading: false,
                my: {},
                residences: [],
                parentResidences: [],
                childResidences: []

            }
        },
        created() {
            this.lang = locale;
            this.setting = config;
            const me = localStorage.getItem('me');
            if (me !== null && me !== '') {
                this.my = JSON.parse(me);
            } else
                router.push('/login');
            self = this;
            if(this.item.status !== undefined) {
                this.getResidence();
                this.item.residence = this.getResidenceName(this.item.province_id, this.item.city_id)
            }
        },
        methods: {
            goDetail() {
                router.push('/order-detail/' + this.item.id)
            },
            cancelItem() {
                this.$ons.notification.confirm(locale.are_you_sure_to_cancel_this_order,{title:locale.confirm_title,buttonLabels:[locale.confirm_cancel,locale.confirm_ok]}).then((resp) => {
                    if (resp) {
                        requestSend(config.API_URL + 'order/process/' + this.item.id + '/cancel').then((resp => {
                            if (resp.status === constants.RES_SUCCESS) {
                                this.$socket.emit('order-changed', {city_id: this.my.city_id,type:'order_cancelled'});
                                this.$emit('refresh')
                            } else {
                                this.$ons.notification.alert(resp.msg,{title:locale.alert_title,buttonLabel:locale.alert_ok});
                            }
                        }))
                    }
                })

            },
            gotItem() {
                this.$ons.notification.confirm(locale.are_you_sure_to_get_product,{title:locale.confirm_title,buttonLabels:[locale.confirm_cancel,locale.confirm_ok]}).then((resp) => {
                    if (resp) {
                        requestSend(config.API_URL + 'order/process/' + this.item.id + '/got').then((resp => {
                            if (resp.status === constants.RES_SUCCESS) {
                                self.$socket.emit('order-got', {type:'order_got',user:this.my.id});
                                this.$emit('refresh')
                            } else {
                                this.$ons.notification.alert(resp.msg,{title:locale.alert_title,buttonLabel:locale.alert_ok});
                            }
                        }))
                    }
                })
            },
            refundItem() {
                this.cancelItem()
            },
            completeItem() {
                if (this.item.price === '' || this.item.price <= 0) {
                    this.$ons.notification.alert(locale.please_wait_price_this_service,{title:locale.alert_title,buttonLabel:locale.alert_ok});
                    return false;
                }
                let self = this;

                this.$ons.notification.confirm(locale.are_you_sure_to_complete_this_order,{title:locale.confirm_title,buttonLabels:[locale.confirm_cancel,locale.confirm_ok]}).then((resp) => {
                    if (resp) {
                        if(self.item.paid_status !== 'paid') {
                            payViaWechat().then((resp => {
                                if (resp.status) {
                                    let Wechat = resp.obj;
                                    requestSend(config.API_URL + 'weixin/order-pay/' + self.item.id).then((resp) => {
                                        self.loading = false;
                                        if(resp.status === constants.RES_SUCCESS) {
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
                                                requestSend(config.API_URL + 'order/process/' + self.item.id + '/complete').then((resp => {
                                                    if (resp.status === constants.RES_SUCCESS) {
                                                        self.$socket.emit('order-changed', {worker: resp.worker,type:'order_completed',user:self.my.id});
                                                        self.$emit('refresh');
                                                        self.$emit('update:index', 2)
                                                    } else {
                                                        this.$ons.notification.alert(resp.msg,{title:locale.alert_title,buttonLabel:locale.alert_ok});
                                                    }
                                                }));
                                                /* requestSend(config.API_URL + 'order/paid/' + self.item.id, {order: orderNo}).then((resp => {
                                                     if (resp.status === constants.RES_SUCCESS) {
                                                         self.$emit('refresh')
                                                     }
                                                     self.loading = false
                                                 }));*/
                                            }, function (msg) {

                                                self.$ons.notification.alert(locale.payment_failed,{title:locale.alert_title,buttonLabel:locale.alert_ok});
                                            })
                                        }

                                    })
                                } else {
                                    self.$ons.notification.alert(locale.weixin_not_support,{title:locale.alert_title,buttonLabel:locale.alert_ok});
                                }
                            }))
                        } else {
                            self.loading = true;
                            requestSend(config.API_URL + 'order/process/' + self.item.id + '/complete').then((resp => {
                                if (resp.status === constants.RES_SUCCESS) {
                                    this.$emit('refresh')
                                } else {
                                    this.$ons.notification.alert(resp.msg,{title:locale.alert_title,buttonLabel:locale.alert_ok});
                                }
                            }));
                        }


                    }
                })
            },
            removeItem() {
                this.$ons.notification.confirm(locale.are_you_sure_to_remove_this_order,{title:locale.confirm_title,buttonLabels:[locale.confirm_cancel,locale.confirm_ok]}).then((resp) => {
                    if (resp) {
                        requestSend(config.API_URL + 'order/process/' + this.item.id + '/remove').then((resp => {
                            if (resp.status === constants.RES_SUCCESS) {
                                this.$emit('refresh')
                            } else {
                                this.$ons.notification.alert(resp.msg,{title:locale.alert_title,buttonLabel:locale.alert_ok});
                            }
                        }))
                    }
                })
            },
            payItem() {
                let self = this;
                payViaWechat().then((resp => {
                    if (resp.status) {
                        let Wechat = resp.obj;
                        requestSend(config.API_URL + 'weixin/order-pay/' + this.item.id).then((resp) => {
                            self.loading = false;
                            if(resp.status === constants.RES_SUCCESS) {
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
                                    requestSend(config.API_URL + 'order/paid/' + self.item.id, {order: orderNo}).then((resp => {
                                        if (resp.status === constants.RES_SUCCESS) {
                                            self.$emit('refresh')
                                        }
                                        self.loading = false
                                    }));
                                }, function (msg) {
                                    self.$ons.notification.alert(locale.payment_failed,{title:locale.alert_title,buttonLabel:locale.alert_ok});
                                })
                            }

                        })
                    } else {
                        this.$ons.notification.alert(locale.weixin_not_support,{title:locale.alert_title,buttonLabel:locale.alert_ok});
                    }
                }))
            },
            ratingItem() {
                router.push('/order-rating/' + this.item.id)
            },
            setAltImg(event) {
                event.target.src = constants.ERR_SRC
            },
            getResidence() {
                const residence = localStorage.getItem('residence');
                if (residence === null) {
                    axios.post(config.API_URL + 'get-residence').then((resp) => {
                        resp = resp.data
                        this.residences = resp;
                        localStorage.setItem('residence', JSON.stringify(resp))
                    }).catch(((error, resp) => {
                        this.$ons.notification.alert(locale.server_error,{title:locale.alert_title,buttonLabel:locale.alert_ok});
                    }))
                } else
                    this.residences = JSON.parse(residence);
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
        }
    }
</script>