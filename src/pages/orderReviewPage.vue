<template>
    <v-ons-page class="payment-page order-manage-page" v-bind:class="loading?'loading':''">
        <v-ons-toolbar class="navigate">
            <div class="left">
                <router-link :to="{path: '/order/2'}" class="btn">
                    <i class="ion-chevron-left"></i>&nbsp;{{lang.back}}
                </router-link>
            </div>
            <div class="center">{{lang.order_rating}}</div>
            <div class="right">
                &nbsp;
            </div>
        </v-ons-toolbar>
        <div class="content">
            <div class="d-flex flex-column h-100">

                <div class="bg-white d-flex flex-column flex-grow-1 p-2 mt-1">
                    <div class="d-flex align-items-center mb-2 pt-3">
                        <label class="mb-0 mr-2">{{ lang.rating_value}}</label>
                        <div>
                            <star-rating v-bind:star-size="25" v-model="params.rating"
                                         v-bind:show-rating="1===0"
                            />
                        </div>
                    </div>
                    <div class="mt-2">
                        <div class="form-group">
                            <textarea class="form-control" :placeholder="lang.rating_comment" rows="3"
                                      v-model="params.comment"></textarea>
                        </div>
                    </div>
                    <div class="flex-grow-1 mb-2 ">
                        <label class="">{{ lang.attached_photos}}</label><br>
                        <div class="attach-files-wrapper row no-gutters">
                            <div class="col-4 p-1" v-for="(image,index) in images">
                                <div class="item position-relative">
                                    <img :src="image"/>
                                    <span class="fa fa-times-circle position-absolute"
                                          @click="images.splice(index,1)"></span>
                                </div>
                            </div>
                            <div class="col-4 p-1" v-if="images.length < maxCount">
                                <div @click="uploadByCamera"
                                     class="add-item flex-column align-items-center justify-content-center item position-relative">
                                    <span class="ion-camera icon"></span>
                                    <span>{{ images.length > 0? lang.can_upload_more+ (maxCount - images.length) + lang.shift:lang.add_photo}}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="form-group ">
                        <button @click="saveRating" class="btn btn-success btn-block btn-square">
                            {{lang.save_rating}}
                        </button>
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
    import router from "@/router";
    import {getResponseErrorMsg, deviceReady, requestSend, imageToBlob} from "@/js/common";
    import StarRating from 'vue-star-rating';

    let self = null;
    export default {
        components: {
            StarRating
        },
        data() {
            return {
                loading: false,
                id: 0,
                currentCount: 0,
                maxCount: 5,
                item: {},
                images: [],
                params: {
                    rating: 0,
                    comment: '',
                    order_id: ''
                },
            }
        },
        methods: {
            getData() {
                //this.loading = true;
                this.params.order_id = this.id;
                /* requestSend(config.API_URL + 'order/detail/' + this.id, {}).then((resp => {
                     if (resp.status === constants.RES_SUCCESS) {
                         this.item = resp.result;
                     }
                     this.loading = false
                 }))*/
            },
            saveRating() {
                if (this.params.comment === '') {
                    this.$ons.notification.toast(locale.order_comment_required, {timeout: 1000});
                    return;
                }
                if (this.params.rating === 0) {
                    this.$ons.notification.toast(locale.order_rating_value_required, {timeout: 1000});
                    return;
                }
                this.loading = true;
                let data = new FormData();
                for (let [key, val] of Object.entries(this.params)) {
                    data.append(key, val)
                }
                let images = this.images;
                images.forEach((image) => {
                    let blob = imageToBlob(image);
                    data.append('upload[]', blob);
                });
                requestSend(config.API_URL + 'order/rating', data, constants.METHOD_POST, true).then((resp => {
                    this.loading = false;
                    if (resp.status === constants.RES_SUCCESS) {
                        if (resp.worker != null)
                            this.$socket.emit('order-changed', {worker: resp.worker,type:'order_rated'});
                        router.push('/my')
                    } else {
                        const msg = getResponseErrorMsg(resp);
                        this.$ons.notification.alert(locale.INVALID_PARAM, {
                            title: locale.alert_title,
                            buttonLabel: locale.alert_ok
                        });
                    }
                }))

            },
            setAltImg(event) {
                event.target.src = constants.ERR_SRC
            },
            uploadByCamera() {
                deviceReady().then((resp => {
                    if (resp.status) {
                        this.images.push(resp.data)
                    }
                }))
            },
        },
        created() {
            this.lang = locale;
            this.constants = constants;
            this.id = this.$route.params.id;
            if (this.id !== 'null')
                this.getData();
            const me = localStorage.getItem('me');
            if (me !== null && me !== '') {
                this.my = JSON.parse(me);
            } else
                router.push('/login');

        },
    }
</script>
