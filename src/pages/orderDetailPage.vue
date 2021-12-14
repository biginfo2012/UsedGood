<template>
    <v-ons-page class="bg-white order-detail-page product-detail-page" v-bind:class="loading?'loading':''">
        <v-ons-toolbar class="navigate">
            <div class="left">
                <a @click="goList" class="btn">
                    <i class="ion-chevron-left"></i>&nbsp;{{lang.back}}
                </a>
            </div>
            <div class="center">{{lang.order_detail}}</div>
            <div class="right">
                &nbsp;
            </div>
        </v-ons-toolbar>
        <div class="content" ref="rootDetail" @scroll="handleScroll">
            <div class="position-relative flex-grow-1">
                <div class="bg-white p-2">
                    <div class="order-wrapper pt-1 mb-2 d-flex justify-content-between">
                        <span class="no text-muted"></span>
                        <span class="badge font-size-13 " :class="item.status !== 'cancelled'?'text-success':'text-danger'">{{lang['order_'+item.status]}}</span>
                    </div>
                    <div  v-if="item.product !== null" class="mb-3">
                        <label class=" mb-1">{{lang.product_info}}</label>
                        <div class="d-flex" >
                            <div class="image-wrapper">
                                <img :src="item.product.main_photo">
                            </div>
                            <div class="cont pb-1 d-flex flex-column flex-grow-1 ">
                                <span class="amount text-danger">&yen;<b>{{ item.model.price | currency}}</b></span>
                                <div class="header">
                                    <p class="title mb-0">{{item.product.name}}</p>
                                    <p class="title mb-0"><small>{{item.model.sku}}</small></p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <hr v-if="item.product !== null">
                    <div class="row no-gutters mb-1">
                        <div class="col-3"><span class="">{{ lang.order_no}}</span></div>
                        <div class="col-9">
                            <span class="">{{item.no}}</span>
                        </div>
                    </div>
                    <div class="row no-gutters mb-1">
                        <div class="col-3"><span class="">{{ lang.order_type}}</span></div>
                        <div class="col-9">
                            <span class="">{{lang['order_type_'+item.type]}}</span>
                        </div>
                    </div>
                    <div class="row no-gutters mb-1">
                        <div class="col-3"><span class="">{{ lang.order_content}}</span></div>
                        <div class="col-9">
                            <p class="mb-1">{{item.content}}</p>
                        </div>
                    </div>
                    <div class="row no-gutters mb-1">
                        <div class="col-3"><span class="">{{ lang.address}}</span></div>
                        <div class="col-9">
                            <span>{{item.residence}} &nbsp;{{item.address}}</span>
                            <span class="ml-3 text-primary" @click="checkLocation"><i class="ion-location"></i>&nbsp; <span class="font-size-13">{{lang.check_location}}</span></span>
                        </div>
                    </div>
                    <div class="row no-gutters mb-1" v-if="item.manager!= null">
                        <div class="col-3"><span class="">{{ lang.manager}}</span></div>
                        <div class="col-9">
                            <div class="worker-wrapper" >
                                <img class="avatar" :src="item.manager.avatar === null?'e':item.manager.avatar"
                                     @error="setAltImg"/>
                                <span class="name">{{item.manager.name}}</span>
                                <span class="contact ml-3 text-primary" @click="callingPhone(item.manager.phone)"><i class="fa fa-mobile"></i>&nbsp; {{item.manager.phone}}</span>
                            </div>
                        </div>
                    </div>
                    <div class="row no-gutters mb-1" v-if="item.model!= null">
                        <div class="col-3"><span class="">{{ lang.price}}</span></div>
                        <div class="col-9">
                            <span ><small>&yen;</small><b>{{ item.model.price | currency }}</b></span>
                        </div>
                    </div>
                    <div class="row no-gutters mb-1" v-if="item.price != null">
                        <div class="col-3"><span class="">{{ lang.service_price}}</span></div>
                        <div class="col-9">
                            <span ><small>&yen;</small><b>{{ item.price | currency }}</b>&nbsp;<i v-if="item.paid_status === 'paid'" class="ion-checkmark-round text-success font-size-12" style="vertical-align: top"></i></span>
                        </div>
                    </div>
                    <div class="row no-gutters mb-1" v-if="item.accepted_at != null">
                        <div class="col-3"><span class="">{{ lang.order_accepted_at}}</span></div>
                        <div class="col-9">
                            <span>{{ item.accepted_at | timeline}}</span>
                        </div>
                    </div>
                    <div class="row no-gutters mb-1" >
                        <div class="col-3"><span class="">{{ lang.order_created_at}}</span></div>
                        <div class="col-9">
                            <span>{{ item.created_at | timeline}}</span>
                        </div>
                    </div>
                    <div class="row no-gutters mb-1" v-if="item.accepted_at != null">
                        <div class="col-3"><span class="">{{ lang.order_accepted_at}}</span></div>
                        <div class="col-9">
                            <span>{{ item.accepted_at | timeline}}</span>
                        </div>
                    </div>
                    <div class="row no-gutters mb-1" v-if="item.completed_at != null">
                        <div class="col-3"><span class="">{{ lang.order_completed_at}}</span></div>
                        <div class="col-9">
                            <span>{{ item.completed_at | timeline}}</span>
                        </div>
                    </div>
                    <div class="row no-gutters mb-1" v-if="item.cancelled_at != null">
                        <div class="col-3"><span class="">{{ lang.order_cancelled_at}}</span></div>
                        <div class="col-9">
                            <span>{{ item.cancelled_at | timeline}}</span>
                        </div>
                    </div>
                </div>

                <div class="position-relative carousel-wrapper bg-white " v-if="images.length > 0">
                    <label class=" mb-2 px-2">{{ lang.attached_photos}}</label>
                    <v-ons-carousel fullscreen swipeable auto-scroll overscrollable
                                    :index.sync="carouselIndex">
                        <v-ons-carousel-item v-for="(value, key) in images" :key="key">
                            <img :src="value"/>
                        </v-ons-carousel-item>

                    </v-ons-carousel>
                    <span class="position-absolute carousel-pagination">{{carouselIndex + 1 }} / {{ images.length}}</span>
                </div>
                <div class="img-item-list" v-if="images.length > 0">
                    <img :src="src" v-for="(src, key) in images" :index="key" :class="carouselIndex===key?'active':''"
                         @click="carouselIndex = key"/>
                </div>
                <div class="video-list" v-if="videos.length > 0">
                    <video style="height: 200px" class="w-100 my-2" v-for="video in videos" :src="video" controls></video>
                </div>
                <div v-if="showScrollTop"
                     class="scroll-top d-flex align-items-center justify-content-center flex-column"
                     @click="scrollToTop">
                    <span class="ion-chevron-up icon"></span>
                    <span>{{lang.scroll_top}}</span>
                </div>
                <div class="form-group payment-wrapper  mb-3 py-2 px-3">
                    <button @click="goList" class="btn btn-light btn-block btn-square">
                        {{lang.back}}
                    </button>
                </div>
            </div>
            <div class="position-absolute residence-wrapper d-flex flex-column" v-bind:class="bindingLocation?'active':''">
                <div class="flex-grow-1"></div>
                <div class="px-2 bg-white">
                    <div class="d-flex justify-content-between pt-2 mb-3">
                        <button @click="bindingLocation = false" class="btn btn-outline-dark btn-sm px-3">{{lang.cancel}}</button>
                    </div>
                    <div class="amap-wrapper w-100" style="height: 350px;" id="map_root">

                    </div>
                </div>

            </div>
        </div>
    </v-ons-page>
</template>

<script>
    import Vue from "vue";
    import VueAMap from "vue-amap";
    import { lazyAMapApiLoaderInstance } from 'vue-amap';
    import config from "@/config";
    import constants from "@/js/constants";
    import locale from "@/js/locale";
    import {loadInAppBrowser,requestSend} from "@/js/common";
    import router from "@/router";

   /* import VueCoreVideoPlayer from 'vue-core-video-player'
    Vue.use(VueCoreVideoPlayer);*/

    Vue.use(VueAMap);
    VueAMap.initAMapApiLoader({
        key: config.AMAP_KEY,
        plugin: ['AMap.Autocomplete', 'AMap.PlaceSearch','AMap.Geolocation', 'AMap.Scale', 'AMap.OverView', 'AMap.ToolBar', 'AMap.MapType'],
        v: '1.4.4'
    });

    let self,map,marker = null;
    export default {
        data() {
            return {
                loading: false,
                id: 0,
                isScrolling: false,
                showScrollTop: false,
                bindingLocation:false,
                carouselIndex: 0,
                images: [],
                videos:[],
                item: {
                    product:null
                },
            }
        },
        methods: {
            handleScroll(event) {
                this.showScrollTop = (this.$refs.rootDetail.scrollTop > 100)
            },
            scrollToTop() {
                this.intervalScroll = setInterval(() => {
                    if (this.$refs.rootDetail.scrollTop <= 0) {
                        clearInterval(this.intervalScroll)
                    }
                    this.$refs.rootDetail.scrollTop -= 50;
                }, 20)
            },
            getData() {
                this.loading = true
                requestSend(config.API_URL + 'order/detail/' + this.id, {}).then((resp => {
                    if (resp.status === constants.RES_SUCCESS) {
                        this.item = resp.result;
                        this.item.residence = this.getResidenceName(this.item.province_id, this.item.city_id)
                        if(this.item.attachs.length > 0)
                            this.images = this.item.attachs.map(resp => {
                                return resp.path;
                            });
                        if(this.item.videos.length > 0) {
                            this.videos = this.item.videos.map(resp => {
                                return resp.path;
                            })
                        }
                    }
                    this.loading = false
                }))
            },
            goList(){
                let type = this.item.status === 'waiting'?0:(this.item.status === 'pending'?1:2);
                router.push('/order/'+type)
            },
            setAltImg(event) {
                event.target.src = constants.ERR_SRC
            },
            getResidence() {
                const residence = localStorage.getItem('residence');
                this.residences = JSON.parse(residence);

            },
            getResidenceName(province, city,onlyCity = false) {
                let name = '';
                const parent = this.residences.filter(val => val.id === province);
                if (parent.length > 0) {
                    name += parent[0].name;
                    const child = parent[0].child.filter(val => val.id === city)
                    if (child.length > 0) {
                        if(onlyCity)
                            return child[0].name;
                        name += ' ' + child[0].name
                    }

                }
                return name;
            },
            callingPhone(phone) {
                loadInAppBrowser().then((data => {
                    data.open('tel:'+phone, '_system');
                }));

            },
            checkLocation() {

                this.bindingLocation = true;
                const info = this.item.user;
                if(info.geodata !== null){
                    this.bindingLocation = true;
                    let pos = JSON.parse(info.geodata);
                    lazyAMapApiLoaderInstance.load().then(() => {
                        map = new AMap.Map('map_root', {
                            zoom:12,
                            center:pos
                        });
                        marker = new AMap.Marker({ map: map });
                        marker.setPosition(pos);
                    });

                } else {
                    lazyAMapApiLoaderInstance.load().then(() => {
                        let address = info.address;
                        map = new AMap.Map('map_root', {
                            zoom:12,
                            resizeEnable: true,
                        });
                        const city = self.getResidenceName(info.province_id,info.city_id,true);

                        AMap.service('AMap.PlaceSearch',function () {
                            let  placeSearch = new AMap.PlaceSearch({
                                city: city,
                            });
                            placeSearch.search(address, function (status, result) {

                                if(status === 'complete') {
                                    let info = result.poiList.pois[0];
                                    let center = [info.location.R,info.location.Q];
                                    marker = new AMap.Marker({ map: map });
                                    marker.setPosition(center);
                                    map.setCenter(center);
                                }

                            });
                        })

                    });
                }
            },
        },
        created() {
            this.lang = locale;
            this.constants = constants
            this.id = this.$route.params.id;
            this.getData();
            this.getResidence();
            self = this
        }
    }
</script>
