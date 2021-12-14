<template>
    <v-ons-page class="bg-1 notify-detail-page" v-bind:class="loading?'loading':''">
        <v-ons-toolbar class="navigate">
            <div class="left" >
                <router-link :to="{path: '/notify'}" class="btn">
                    <i class="ion-chevron-left"></i>&nbsp;{{lang.back}}
                </router-link>
            </div>
            <div class="center">{{lang.notify_content}}</div>
            <div class="right">
                &nbsp;
            </div>
        </v-ons-toolbar>
        <div class="content">
            <div class="d-flex flex-column h-100 p-2 ">
                <div class="flex-grow-1 d-flex flex-column  form-wrapper border-radius-5 bg-white pt-5 px-4 pb-4">
                    <div class="flex-grow-1">
                        <h3 class="font-weight-bold">{{item.title}}</h3>
                        <p>{{item.content}}</p>
                        <div class="text-right">
                            <span class="text-muted">{{item.updated_at | timeline}}</span>
                        </div>
                    </div>
                    <div class="form-group">
                        <router-link :to="{path: '/'}" class="btn btn-light btn-block">
                            {{lang.back}}
                        </router-link>
                    </div>
                </div>
            </div>
        </div>
    </v-ons-page>
</template>

<script>
    import config from "@/config";
    import constants from "@/js/constants";
    import locale from "@/js/locale";
    import {requestSend} from "@/js/common";

    let self = null;
    export default {
        data() {
            return {
                loading: false,
                id:0,
                item:{}
            }
        },
        methods: {
            getData() {
                this.loading = true
                requestSend(config.API_URL + 'notify-detail/' + this.id,{},constants.METHOD_GET).then((resp => {
                    if (resp.status === constants.RES_SUCCESS) {
                        this.item = resp.result
                    }
                    this.loading = false
                }))
            },
        },
        created() {
            this.lang = locale;
            this.id = this.$route.params.id;
            this.getData();
            self = this
        }
    }
</script>
