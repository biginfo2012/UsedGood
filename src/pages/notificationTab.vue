<template>
    <v-ons-page class="bg-white notification-page">
        <div class="pt-3">
            <div class="item d-flex align-items-center" v-for="(item,index) in items" @click="readNotify(item,index)">
                <div class="icon-wrapper" :class="item.type">
                    <span class="ion-chatbubble"></span>
                </div>
                <div class="cont d-flex flex-column flex-grow-1 justify-content-between">
                    <div class="header d-flex justify-content-between">
                        <span class="title">{{item.title | truncate(12,'...')}}</span>
                        <span class="timeline text-muted">{{item.updated_at | timeline}}</span>
                    </div>
                    <div class="content position-relative">
                        <label class="m-0">
                            {{item.content }}
                        </label>
                        <div v-if="item.is_checked === 0" class="spot"></div>
                    </div>
                </div>
            </div>
            <div v-if="items.length === 0" class="p-3">
                <div class="separator">{{ lang.no_have_notifications}}</div>
            </div>
        </div>
    </v-ons-page>
</template>
<script>
    import Vue from "vue";
    import config from "@/config";
    import {requestSend} from "@/js/common";
    import constants from "@/js/constants";
    import locale from "@/js/locale";
    import router from "@/router";

    let self;
    export default {
        data() {
            return {
                loading: false,
                page: 0,
                items: [],
                readItems: [],
                totalCount: 0,
                seeDetail: false,
                detail: {},
                my:{}
            }
        },
        methods: {
            getList() {
                let messages = localStorage.getItem('messages');
                if (messages !== null) {
                    messages = JSON.parse(messages);
                    this.readItems = messages;

                }
                this.getNew();
            },
            getNew() {
                this.loading = true;
                let reads = this.readItems;
                requestSend(config.API_URL + 'notify', {}, constants.METHOD_GET).then((resp => {
                    this.totalCount = resp.length;
                    this.items = [...resp, ...reads];
                    this.loading = false;
                }))
            },
            setAsRead(item, index) {
                this.items[index].is_checked = 1;
                if(this.totalCount > 0)
                    this.totalCount--;
                this.readItems.unshift(item)
            },
            readNotify(item, index) {
                router.push('/notify-detail/' + item.id)
                if (item.is_checked === 0)
                    this.setAsRead(item, index)
            }
        },
        created() {
            this.lang = locale;
            const me = localStorage.getItem('me');
            if (me !== null && me !== '')
                this.my = JSON.parse(me);
            else
                router.push('/login');
            this.getList();
            self = this
            this.$socket.on('user-notify', data => {
                if(data.user !== undefined && this.my.id === data.user){
                    this.getList()
                }
            });
            this.$socket.on('user-order-changed', data => {
                if ((data.type === 'order_accepted' || data.type === 'order_set_price') && data.user === this.my.id) {
                    this.getList()
                }
            });
        },
        watch: {
            'totalCount': function (newVal) {
                let badge = newVal;
                if (newVal === 0)
                    badge = '';
                this.$emit('update:badge', badge)
            },
            'readItems': function (newVal) {
                localStorage.setItem('messages',JSON.stringify(newVal));
            }
        }
    }
</script>
