<template>
    <v-ons-page class="bg-white" v-bind:class="loading?'loading':''">
        <v-ons-toolbar class="navigate">
            <div class="left">
                <router-link :to="{path: '/login'}" class="btn">
                    <i class="ion-chevron-left"></i>&nbsp;{{lang.login}}
                </router-link>
            </div>
            <div class="center">{{lang.forgot_password}}</div>
            <div class="right">
                &nbsp;
            </div>
        </v-ons-toolbar>
        <div class="content">
            <div class="d-flex flex-column h-100 p-2 register-page">
                <div class="flex-grow-1 d-flex flex-column form-wrapper border-radius-5 bg-white pt-5 px-4 pb-4">
                    <div class="flex-grow-1">
                        <div class="form-group row">
                            <label class="col-form-label col-3">{{lang.phone}}</label>
                            <input type="number" class="form-control col-9" v-model="params.phone"
                                   :placeholder="lang.please_input_phone">
                        </div>
                        <div class="form-group row">
                            <label class="col-form-label col-3">{{lang.verify_code}}</label>
                            <div class="input-group col-9 pl-0">
                                <input type="number" class="form-control " v-model="params.verify_code"
                                       :placeholder="lang.please_input_verify_code">
                                <div class="input-group-append d-flex align-items-center">
                                <span v-if="verifyCode.count === 0" @click="sendVerifyCode"
                                      class="btn btn-sm btn-success btn-verify-code">{{lang.send_verify_code}}</span>
                                    <span v-if="verifyCode.count > 0" class="btn btn-sm btn-verify-code">{{verifyCode.count + lang.waiting_verify_code}}</span>
                                </div>
                            </div>
                        </div>
                        <div class="form-group row">
                            <label class="col-form-label col-3">{{lang.password}}</label>
                            <input type="password" class="form-control col-9" v-model="params.password"
                                   :placeholder="lang.please_input_password">
                        </div>
                        <div class="form-group row">
                            <label class="col-form-label col-3">{{lang.password_confirmation}}</label>
                            <input type="password" class="form-control col-9" v-model="params.password_confirmation"
                                   :placeholder="lang.please_input_password_again">
                        </div>
                    </div>
                    <div class="pb-2">
                        <button class="btn btn-success btn-block" @click="submit" :disabled="loading">{{lang.submit}}</button>
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
    import {validCheck, validPhone,getResponseErrorMsg} from "@/js/common";
    import VueScrollPicker from "vue-scroll-picker";
    import "vue-scroll-picker/dist/style.css";
    Vue.use(VueScrollPicker);

    let self = null;
    export default {
        data() {
            return {
                loading: false,
                isReadAgreement: true,
                bindResidence: false,
                params: {
                    phone: '',
                    verify_code: '',
                    password_confirmation: '',
                    password: ''
                },
                verifyCode: {
                    sendingVerifyCode: false,
                    count: 0,
                    timer: null,
                },
                rules: {
                    'phone': ['required', 'phone'],
                    'password': ['required', 'password'],
                    'password_confirmation':['required','confirmed'],
                    'verify_code':['required','verifyCode'],
                }
            }
        },
        created() {
            this.lang = locale;
            self = this

        },
        methods: {
            sendVerifyCode() {
                if (!validPhone(this.params.phone)) {
                    this.$ons.notification.toast(locale.wrong_mobile_format, {timeout: 2000});
                    return
                }
                const TIME_COUNT = 60;
                axios.post(config.API_URL + 'verify-phone',{phone:this.params.phone}).then((resp => {
                    if (!this.verifyCode.timer && resp.data.status === constants.RES_SUCCESS ) {
                        self.verifyCode.count = TIME_COUNT;
                        self.verifyCode.timer = setInterval(() => {
                            if (self.verifyCode.count > 0 && self.verifyCode.count <= TIME_COUNT) {
                                self.verifyCode.count--;
                            } else {
                                clearInterval(self.verifyCode.timer);
                                self.verifyCode.timer = null;
                            }
                        }, 1000)
                    }
                }))

            },
            submit() {
                this.loading = true;
                let errorMsg = validCheck(this.params, this.rules)

                if(errorMsg !== null) {
                    this.loading = false;
                    this.$ons.notification.toast(errorMsg, { timeout: 1000 });
                    return ;
                }
                axios.post(config.API_URL + 'forgot-password/user', this.params).then((resp) => {
                    resp = resp.data
                    this.loading = false;
                    if (resp.status === constants.RES_SUCCESS) {
                        this.$ons.notification.alert(locale.password_set_successful,{title:locale.alert_title,buttonLabel:locale.alert_ok});
                        router.push('/login')
                    } else {
                        this.$ons.notification.alert(locale.INVALID_PARAM,{title:locale.alert_title,buttonLabel:locale.alert_ok});
                    }
                }).catch(((error) => {
                    this.loading = false;
                    const msg = getResponseErrorMsg(error.response.data);
                    this.$ons.notification.alert(locale.INVALID_PARAM,{title:locale.alert_title,buttonLabel:locale.alert_ok});
                }))

            },
        },
    }
</script>
