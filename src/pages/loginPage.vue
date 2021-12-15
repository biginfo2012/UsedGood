<template>
    <v-ons-page class="bg-1" v-bind:class="loading?'loading':''">
        <v-ons-toolbar class="navigate">
            <div class="left">
                &nbsp;
            </div>
            <div class="center">{{lang.login}}</div>
            <div class="right">
                &nbsp;
            </div>
        </v-ons-toolbar>
        <div class="content">
            <div class="d-flex flex-column h-100 px-2 pb-0 login-page">
                <div class="flex-grow-1 justify-content-center align-items-center logo-wrapper d-flex flex-column">
                    <span class="logo-text">{{lang.login}}</span>
                </div>
                <div class="form-wrapper top-radius-50 bg-white pt-0 px-4 pb-5 has-validation mb-5">
                    <div class="form-group">
                        <label class="col-form-label">{{lang.email}}</label>
                        <input type="email" class="form-control" v-model="params.email"
                               :placeholder="lang.please_input_email">
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
                        <button class="btn btn-secondary btn-block btn-have-loading" @click="authCheck"
                                :disabled="loading">{{lang.login}}
                        </button>
                    </div>
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
    import {validCheck} from "@/js/common";
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
                    email: '',
                    password: ''
                },
                rules: {'email': ['required', 'email'], 'password': ['required', 'password']}
            }
        },
        created() {
            this.lang = locale;
            this.setting = config;
            self = this;
        },
        methods: {
            authCheck() {
                let errorMsg = validCheck(this.params, this.rules)
                if (errorMsg !== null) {
                    this.$ons.notification.toast(errorMsg, {timeout: 1000});
                    return;
                }
                this.loading = true;
                router.push('/home')
                //todo checking validation
                // axios.post(config.API_URL + 'login/user', this.params).then((resp) => {
                //     resp = resp.data
                //     this.loading = false
                //     if (resp.status === constants.RES_SUCCESS) {
                //         const token = resp.token;
                //         const me = JSON.stringify(resp.result);
                //         localStorage.setItem('token', token)
                //         localStorage.setItem('me', me);
                //         router.push('/')
                //     } else {
                //         this.$ons.notification.alert(locale.login_failed,{title:locale.alert_title,buttonLabel:locale.alert_ok});
                //     }
                // }).catch(((error, resp) => {
                //     this.$ons.notification.alert(locale.login_failed,{title:locale.alert_title,buttonLabel:locale.alert_ok});
                //     this.loading = false
                // }))
            },
        }
    }
</script>
