<template>
    <v-ons-page class="bg-1" v-bind:class="loading?'loading':''">
        <v-ons-toolbar class="navigate">
            <div class="left">
                &nbsp;
            </div>
            <div class="center">{{lang.login}}</div>
            <div class="right">
                <router-link :to="{path: '/register'}" class="btn">
                    {{lang.register}} &nbsp;<i class="ion-chevron-right"></i>
                </router-link>
            </div>
        </v-ons-toolbar>
        <div class="content">
            <div class="d-flex flex-column h-100 px-2 pb-0 login-page">
                <div class="flex-grow-1 justify-content-center align-items-center logo-wrapper d-flex flex-column">
                    <img src="../assets/logo/logo.png"/>
                    <span class="logo-text">{{lang.logo_text}}</span>
                </div>
                <div class="form-wrapper top-radius-50 bg-white pt-3 px-4 pb-4 has-validation">
                    <div class="form-group">
                        <label class="col-form-label">{{lang.phone}}</label>
                        <input type="number" class="form-control" v-model="params.phone"
                               :placeholder="lang.please_input_phone">
                    </div>
                    <div class="form-group">
                        <label class="col-form-label">{{lang.password}}</label>
                        <input type="password" class="form-control" v-model="params.password"
                               :placeholder="lang.please_input_password">
                    </div>
                    <div class="text-right">
                        <router-link :to="{path:'/forgot-pass'}" class="btn  text-muted font-size-12">
                            {{lang.forgot_account}}
                        </router-link>
                    </div>
                    <div class="py-2">
                        <button class="btn btn-success btn-block btn-have-loading" @click="authCheck"
                                :disabled="loading">{{lang.login}}
                        </button>
                        <button class="btn btn-outline-light text-success btn-block" @click="wepayLogin" :disabled="loading">
                            <img :src="setting.ASSET_URL + 'images/icon/weixin.svg'" height="25"/>&nbsp;{{lang.register_via_wechat}}
                        </button>
                    </div>
                    <!--<div>
                        <button class="btn btn-success btn-block btn-have-loading" @click="wepayLogin"
                                :disabled="loading">微信{{lang.login}}
                        </button>
                    </div>-->
                    <span class="text-muted font-size-12">{{lang.company_name}}</span>
                </div>
            </div>

        </div>
    </v-ons-page>
</template>

<script>
    import axios from 'axios';
    import config from "@/config";
    import constants from "@/js/constants";
    import locale from "@/js/locale";
    import router from "@/router";
    import {validCheck, payViaWechat, requestSend} from "@/js/common";
    let self;
    export default {
        data() {
            return {
                loading: false,
                isSubmitted: false,
                errors: {},
                toastVisible: false,
                setting:null,
                params: {
                    phone: '',
                    password: ''
                },
                rules: {'phone': ['required', 'phone'], 'password': ['required', 'password']}
            }
        },
        created() {
            this.lang = locale;
            this.setting = config;
            self = this;
        },
        methods: {
            wepayLogin() {
                payViaWechat().then((weResp => {
                    let scope = "snsapi_userinfo",
                        state = "_" + (+new Date());
                    if (weResp.status) {
                        let Wechat = weResp.obj;
                        Wechat.auth(scope,state,function (resp) {
                            const code = resp.code;
                            const url = 'https://api.weixin.qq.com/sns/oauth2/access_token?appid=' + config.WECHATCLIENTID + '&secret=' + config.WECHATSECRET + '&code=' + code + '&grant_type=authorization_code';
                            axios.get(url).then((accessTokenResponse => {
                                const data = accessTokenResponse.data;
                                const accessToken = data.access_token;
                                const openId = data.openid;
                                const url2 = 'https://api.weixin.qq.com/sns/userinfo?access_token=' + accessToken + '&openid=' + openId + '&lang=zh_CN';
                                axios.get(url2).then(resp2 => {
                                    const userInfo = resp2.data;
                                    const unionId = userInfo.unionid;
                                    self.loading = true;
                                    requestSend(config.API_URL + 'weixin-login/user/'+ unionId,{},constants.METHOD_GET).then((resp => {
                                        self.loading = false;
                                        if (resp.status === constants.RES_SUCCESS) {
                                            const token = resp.token;
                                            const me = JSON.stringify(resp.result);
                                            localStorage.setItem('token', token);
                                            localStorage.setItem('me', me);
                                            router.push('/')
                                        } else {
                                            self.$ons.notification.alert(locale.login_failed,{title:locale.alert_title,buttonLabel:locale.alert_ok});
                                        }
                                    }))
                                });
                            }))
                        }, function (reason) {
                            self.$ons.notification.alert(locale.INVALID_PARAM,{title:locale.alert_title,buttonLabel:locale.alert_ok});
                        })
                    } else {
                        self.$ons.notification.alert(locale.weixin_not_support,{title:locale.alert_title,buttonLabel:locale.alert_ok});
                    }
                }));
            },
            authCheck() {
                let errorMsg = validCheck(this.params, this.rules)
                if (errorMsg !== null) {
                    this.$ons.notification.toast(errorMsg, {timeout: 1000});
                    return;
                }
                this.loading = true;
                //todo checking validation
                axios.post(config.API_URL + 'login/user', this.params).then((resp) => {
                    resp = resp.data
                    this.loading = false
                    if (resp.status === constants.RES_SUCCESS) {
                        const token = resp.token;
                        const me = JSON.stringify(resp.result);
                        localStorage.setItem('token', token)
                        localStorage.setItem('me', me);
                        router.push('/')
                    } else {
                        this.$ons.notification.alert(locale.login_failed,{title:locale.alert_title,buttonLabel:locale.alert_ok});
                    }
                }).catch(((error, resp) => {
                    this.$ons.notification.alert(locale.login_failed,{title:locale.alert_title,buttonLabel:locale.alert_ok});
                    this.loading = false
                }))
            },
        }
    }
</script>
