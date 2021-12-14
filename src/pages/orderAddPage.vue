<template>
    <v-ons-page class="payment-page order-manage-page" v-bind:class="loading?'loading':''">
        <v-ons-toolbar class="navigate">
            <div class="left">
                <router-link :to="{path: '/order/0'}" class="btn">
                    <i class="ion-chevron-left"></i>&nbsp;{{lang.back}}
                </router-link>
            </div>
            <div class="center">{{lang.create_order}}</div>
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
                        <p class="mb-0 font-size-14">{{params.residence}} {{params.address}}</p>
                    </div>
                    <span class="pl-2 d-flex align-items-center" @click="changeAddress"><span class="font-size-13">{{lang.edit}}</span>  &nbsp;<i
                            class="ion-chevron-right"></i> </span>
                </div>
                <div class="bg-white d-flex flex-column flex-grow-1 p-2 mt-1">
                    <div class="mt-2">
                        <div class="d-flex">
                            <label class="font-weight-bold">{{ lang.order_type}}</label>
                            <label class="ml-3">
                                <span class="badge badge-success">{{ categoryName }}</span>
                            </label>
                        </div>
                    </div>
                    <div class="mt-2">
                        <label class="font-weight-bold">{{ lang.order_content}}</label>
                        <div class="form-group">
                            <textarea class="form-control" rows="3" v-model="params.content"></textarea>
                        </div>
                    </div>
                    <div class="flex-grow-1 mb-2">
                        <label class="font-weight-bold">{{ lang.attached_photos}}</label><br>
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
                    <div class="flex-grow-1 mb-2">
                        <label class="font-weight-bold">{{ lang.attached_medias}}</label><br>
                        <div class="attach-files-wrapper row no-gutters">
                            <div class="col-4 p-1" v-for="(media,index) in medias">
                                <div class="item position-relative">
                                    <div class="w-100 d-flex flex-column align-items-center justify-content-center">
                                        <span class="icon ion-android-film" style="font-size: 2em;line-height: 0.5"></span>
                                        <span>{{ index + 1 }}</span>
                                    </div>
                                    <span class="fa fa-times-circle position-absolute"
                                          @click="medias.splice(index,1)"></span>
                                </div>
                            </div>
                            <div class="col-4 p-1" v-if="loadingMedia">
                                <div class="item position-relative">
                                    <div class="w-100 d-flex flex-column align-items-center justify-content-center">
                                        <span class="btn-loading-spinner" ></span>
                                    </div>
                                </div>
                            </div>
                            <div class="col-4 p-1" >
                                <div @click="uploadByVideo"
                                     class="add-item flex-column align-items-center justify-content-center item position-relative">
                                    <span class="ion-ios-videocam icon"></span>
                                    <span>{{ medias.length > 0? lang.can_upload_more+ (maxCount - medias.length) + lang.shift:lang.add_media}}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="form-group ">
                        <button @click="saveOrder" class="btn btn-success btn-block btn-square">
                            {{lang.take_order}}
                        </button>
                    </div>
                </div>
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
    import config from "@/config";
    import constants from "@/js/constants";
    import locale from "@/js/locale";
    import router from "@/router";
    import {
        getResponseErrorMsg,
        deviceReady,
        requestSend,
        imageToBlob,
        deviceReadyVideo,
        GetFileObjectFromURL, toBase64, checkPermission
    } from "@/js/common";
    import VueScrollPicker from "vue-scroll-picker";
    import "vue-scroll-picker/dist/style.css";
    import axios from "axios";


    Vue.use(VueScrollPicker);

    let self = null;

    export default {
        data() {
            return {
                loading: false,
                loadingMedia:false,
                id: 0,
                currentCount: 0,
                maxCount: 5,
                images: [],
                medias:[],
                categoryName:'',
                params: {
                    type: '',
                    content: '',
                    address: '',
                    province_id: '',
                    city_id: '',
                    residence: '',
                    id: ''
                },
                changingAddress: false,
                temp: {
                    province_id: 0,
                    city_id: 0,
                    address: ''
                },
                categories:[],
                residences: [],
                parentResidences: [],
                childResidences: [],
            }
        },
        methods: {
            goSale() {
                router.push('/product');
            },
            getData() {
                this.loading = true;
                requestSend(config.API_URL + 'order/detail/' + this.id, {}).then((resp => {
                    if (resp.status === constants.RES_SUCCESS) {
                        this.item = resp.result;
                        this.item.residence = this.getResidenceName(this.item.province_id, this.item.city_id)
                        if (this.item.attachs.length > 0)
                            this.images = this.item.attachs.map(resp => {
                                return resp.path;
                            })
                    }
                    this.loading = false
                }))
            },
            saveOrder() {
                if (this.params.content === '' && this.medias.length === 0 && this.images.length === 0) {
                    this.$ons.notification.toast(locale.order_params_required, {timeout: 1000});
                    return;
                }
                this.loading = true;
                let data = new FormData();
                for (let [key, val] of Object.entries(this.params)) {
                    data.append(key, val)
                }
                let images = this.images;
                images.forEach((image) => {
                    if (image.includes('http'))
                        data.append('attachs[]', image);
                    else {
                        let blob = imageToBlob(image);
                        data.append('upload[]', blob);
                    }
                });
                this.medias.forEach((media) => {
                    data.append('media[]', media);
                });
                const url = this.params.id === '' ? 'order/create' : 'order/update/' + this.params.id;
                requestSend(config.API_URL + url, data, constants.METHOD_POST, true).then((resp => {
                    this.loading = false;
                    if (resp.status === constants.RES_SUCCESS) {
                        this.$socket.emit('order-changed', {city_id: this.my.city_id,type:'order_created',user:this.my.id})
                        router.push('/order/0')
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
            uploadByVideo() {
                let self = this;
                /*let path = 'https://pt153.com/apps/12.mp4';
                console.log(path);
                GetFileObjectFromURL(path).then(resp2 => {
                    this.loadingMedia = true;
                    //alert(resp2);
                    self.uploadVideoFile(resp2);
                    //self.medias.push(resp2);
                })
                return ;*/
                checkPermission().then((resp3 =>{
                    deviceReadyVideo().then((resp => {
                        if(resp.status) {
                            self.loadingMedia = true;
                            toBase64(resp.data).then((resp2 => {
                                self.uploadVideoFile(resp2.data);
                            }))
                        }
                    }))
                }))
                /*deviceReadyVideo().then((resp => {
                    if(resp.status) {
                        self.loadingMedia = true;
                        toBase64(resp.data).then((resp2 => {
                            self.uploadVideoFile(resp2.data);
                        }))
                    }
                }))*/
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
            },
            getCategoryName(category) {
                let name = '';
                const parent = this.categories.filter(val => val.id === category);
                if (parent.length > 0) {
                    name = parent[0].name;
                }
                return name;
            },
            uploadVideoFile(blob) {
                let data = new FormData();
                blob = imageToBlob(blob);
                data.append('media', blob);
                requestSend(config.API_URL + 'upload-video', data, constants.METHOD_POST, true).then((resp => {
                    this.loadingMedia = false;
                    if (resp.status === constants.RES_SUCCESS) {
                        this.medias.push(resp.msg);
                    } else {
                        this.$ons.notification.alert(locale.INVALID_PARAM, {
                            title: locale.alert_title,
                            buttonLabel: locale.alert_ok
                        });
                    }
                }))
            },
            getCategory() {
                requestSend(config.API_URL + 'category', {}, constants.METHOD_GET).then((resp => {
                    this.categories = resp;
                    localStorage.setItem('category', JSON.stringify(resp));
                }))
            },
        },
        created() {
            this.lang = locale;
            this.constants = constants;
            this.id = this.$route.params.id;
            this.params.type = this.$route.params.type;
            if (this.id !== 'null')
                this.getData();
            const me = localStorage.getItem('me');
            if (me !== null && me !== '') {
                this.my = JSON.parse(me);
                this.params.province_id = this.my.province_id;
                this.params.city_id = this.my.city_id;
                this.params.address = this.my.address;
                this.params.name = this.my.name;
            } else
                router.push('/login');
            this.getResidence();
            this.params.residence = this.getResidenceName(this.my.province_id, this.my.city_id);
            let categories = localStorage.getItem('category');
            if(categories === null || categories === '')
                this.getCategory();
            else
                this.categories = JSON.parse(categories);
            this.categoryName = this.getCategoryName(this.params.type)
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
