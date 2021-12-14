<template>
    <v-ons-page class="bg-1 order-page" >
        <div>
            <div v-if="loading" class="p-1 d-flex align-items-center justify-content-center"><span class="btn-loading-spinner"></span></div>
            <order-item :item="item" v-for="item in orders" :key="item.id" @refresh="getList"></order-item>
            <div v-if="orders.length === 0" class="p-3">
                <div class="text-center">
                    <span class="fa fa-envelope-open-o fa-3x py-4 text-success"></span>
                </div>
                <div class="separator">{{ lang.no_have_order_item}}</div>
            </div>
        </div>
    </v-ons-page>
</template>
<script>
    import config from "@/config";
    import {requestSend} from "@/js/common";
    import constants from "@/js/constants";
    import locale from "@/js/locale";
    import orderItem from "@/components/orderItem";
    import router from "@/router";


    export default {
        components: {
            orderItem
        },
        data() {
            return {
                loading: false,
                page: 0,
                length: 30,
                orders: [1,1],
            }
        },
        methods: {
            getList() {
                this.loading = true
                requestSend(config.API_URL + 'order/get/completed', {
                    page: this.page,
                    length: this.length
                }).then((resp => {
                    this.loading = false
                    if (resp.status === constants.RES_SUCCESS) {
                        this.orders = resp.data;
                    }
                }))
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

            this.$socket.on('user-order-changed', data => {
                if ((data.type === 'order_completed' || data.type === 'order_got' || data.type === 'order_set_price') && data.user === this.my.id) {

                    this.getList()
                }
            });

        }
    }
</script>
