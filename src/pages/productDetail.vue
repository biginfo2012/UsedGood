<template>
    <v-ons-page class="product-detail-page" v-bind:class="loading?'loading':''">
        <div class="content" ref="rootDetail" @scroll="handleScroll" >
            <div class="position-relative">
                <div class="static-toolbar  d-flex justify-content-between align-items-center" id="navbar"
                     v-bind:class="navbarActive?'active':''">
                    <router-link :to="{path: '/product'}"><span class="ion-chevron-left"></span></router-link>
                    <!--<span class="ion-chatbubbles"></span>-->
                </div>
                <div class="position-relative carousel-wrapper">
                    <v-ons-carousel fullscreen swipeable auto-scroll overscrollable
                                    :index.sync="carouselIndex">
                        <v-ons-carousel-item v-for="(value, key) in images" :key="key">
                            <img :src="value"/>
                        </v-ons-carousel-item>

                    </v-ons-carousel>
                    <span class="position-absolute carousel-pagination">{{carouselIndex + 1 }} / {{ images.length}}</span>
                </div>

                <div class="img-item-list" v-if="images.length > 1">
                    <img :src="src" v-for="(src, key) in images" :key="key" :index="key" :class="carouselIndex===key?'active':''"
                         @click="carouselIndex = key"/>
                </div>
                <div class="bg-white d-flex justify-content-between p-2">
                    <span v-if="params.model == null && item!= null" class="price-amount"><small>&yen;</small>{{ item.items[0].price | currency}} ~ <span v-if="item.items.length > 1 && item.items[item.items.length - 1].price !== item.items[0].price "><small>&yen;</small>{{ item.items[item.items.length - 1].price | currency}}</span>
                    </span>
                    <span v-else class="price-amount"><small>&yen;</small>{{ params.model.price | currency}}</span>
                    <span class="text-muted font-size-12" v-if="item.sold_orders_count > 0">{{ lang.sold_count}} <b>{{item.sold_orders_count}}</b></span>
                </div>
                <div class="bg-white px-2 pb-2">
                    <p class="font-weight-bold">{{ item.name}}</p>
                    <div class="d-flex">
                        <label class="m-1 font-size-14 " style="white-space: pre">{{lang.model}}</label><br>
                        <div>
                            <span v-for="sku in item.items" @click="setParam('model',sku)" :class="params.model != null && params.model.id=== sku.id?'badge-success':'badge-light'" class="cursor-pointer badge py-1 px-2 m-1">{{ sku.sku}}</span>
                        </div>
                    </div>
                </div>
                <div class="mt-1 p-2 bg-white">
                    <h4 class="font-weight-bold">{{ lang.product_detail}}</h4>
                    <div class="bg-light p-1">
                        <v-zoomer v-for="photo in item.photos" :key="photo.path" class="w-100">
                            <img
                                    :src="photo.path"
                                    style="object-fit: contain; width: 100%; height: 100%;"
                            >
                        </v-zoomer>
                    </div>
                    <div class="bg-light p-1 product-detail-content">
                       <!-- <img v-for="photo in item.photos" :src="photo.path" class="w-100">-->
                        <!--<div>
                            <div class="text-muted">品牌</div>
                            <span>北京普泰科技</span>
                        </div>
                        <div>
                            <div class="text-muted">锅炉类型</div>
                            <span>热水锅炉</span>
                        </div>
                        <div>
                            <div class="text-muted">型号</div>
                            <span>SR-915</span>
                        </div>
                        <div>
                            <div class="text-muted">规格</div>
                            <span>65*45*35厘米</span>
                        </div>
                        <div>
                            <div class="text-muted">加热方式</div>
                            <span>电加热</span>
                        </div>
                        <div>
                            <div class="text-muted">水位容积</div>
                            <span>小于30L</span>
                        </div>
                        <div>
                            <div class="text-muted">冷气负载</div>
                            <span>907,200kcal/h</span>
                        </div>
                        <div>
                            <div class="text-muted">采暖负荷</div>
                            <span>1,061,400 kcal/h</span>
                        </div>-->
                        <div class="pt-2">
                            <p v-html="item.description"></p>
                        </div>
                    </div>
                </div>
                <div class="review-list mt-1 p-2 bg-white">
                    <h4 class="font-weight-bold">{{ lang.product_review}}({{item.reviews.length}})</h4>
                    <div class="item" v-if="item.reviews.length > 0" v-for="review in item.reviews">
                        <div class="d-flex align-items-center avatar-wrapper">
                            <img :src="review.user.avatar"  />
                            <span class="text-muted mr-2">{{review.user.username}}</span>
                            <star-rating v-bind:star-size="20"
                                         v-bind:show-rating="1===0"
                                         :rating="review.rating"
                                         :read-only="1===1"/>
                        </div>
                        <div class="content">
                            <p>{{review.comment}}</p>
                        </div>
                    </div>
                </div>
                <div class="related-products mt-1 p-2 bg-white"
                     v-if="item.relatedProducts && item.relatedProducts.length > 0">
                    <h4 class="font-weight-bold">{{ lang.related_products}}</h4>
                    <div class="bg-light ">
                        <div class="product-item" v-for="product in item.relatedProducts"
                             @click="gotoProduct(product.id)">
                            <a href="javascript:void(0)">
                                <div class="img">
                                    <img :src="product.main_photo"/>
                                </div>
                                <div class="cont flex-grow-1 d-flex flex-column">
                                    <label class="title flex-grow-1">{{product.name | truncate(70, '...')}}</label>
                                    <div>
                                        <span class="category">#{{product.category.name}}</span><br>
                                        <span class="currency text-danger">&yen;</span> <span class="amount">{{ product.items[0].price | currency}}</span>
                                        <span v-if="product.items.length > 1 && product.items[product.items.length - 1].price !== product.items[0].price " class="currency text-danger"> ~ &yen;</span> <span class="amount">{{ product.items[product.items.length - 1].price | currency}}</span>
                                    </div>
                                </div>
                            </a>
                        </div>
                    </div>
                    <div class="separator">{{ lang.no_have_anymore_products}}</div>
                </div>
                <div class="payment-wrapper bg-white">
                     <span v-if="params.model == null && item!= null" class="price-amount"><small>&yen;</small>{{ item.items[0].price | currency}} ~<span v-if="item.items.length > 1 && item.items[item.items.length - 1].price !== item.items[0].price "><small>&yen;</small>{{ item.items[item.items.length - 1].price | currency}}</span>
                    </span>
                    <span v-else class="price-amount"><small>&yen;</small>{{ params.model.price | currency}}</span>
                    <button type="button" class="payment-btn btn" @click="takeOrder">{{lang.take_order}}</button>
                </div>
                <div v-if="showScrollTop" class="scroll-top d-flex align-items-center justify-content-center flex-column" @click="scrollToTop">
                    <span class="ion-chevron-up icon"></span>
                    <span>{{lang.scroll_top}}</span>
                </div>
            </div>
            <div class="confirm-wrapper d-flex flex-column" v-if="takingOrder">
                <div class="flex-grow-1"></div>
                <div class="d-flex flex-column p-2 bg-white">
                    <div class="d-flex">
                        <div class="img-wrapper">
                            <img :src="item.main_photo" />
                        </div>
                        <div class="flex-grow-1 ml-2 d-flex justify-content-between">
                            <div class="d-flex flex-column">
                                 <span v-if="params.model == null && item!= null" class="price-amount"><small>&yen;</small>{{ item.items[0].price | currency}} ~ <span v-if="item.items.length > 1 && item.items[item.items.length - 1].price !== item.items[0].price ">&yen;{{ item.items[item.items.length - 1].price | currency}}</span>
                                 </span>
                                <span v-else class="price-amount"><small>&yen;</small>{{ params.model.price | currency}}</span>
                                <div>
                                    <span class="badge badge-success font-size-12 px-2 py-1" :class="params.required_service?'badge-success':'badge-light'" @click="setParam('required_service')"><i class="ion-checkmark"></i> {{ lang.required_install_service}}</span>
                                    <span class="service-amount-description" v-if="params.required_service">要商论服务费</span>
                                </div>
                            </div>
                            <span class="ion-close" @click="takingOrder = false"></span>
                        </div>
                    </div>

                    <div class="d-flex flex-column my-3 options">
                        <label class="m-2 text-nowrap font-size-13 mb-0 font-weight-bold">{{lang.model}}</label>
                        <div>
                            <span class="badge py-1 px-2 m-1" v-for="one in item.items" :class="params.model != null && params.model.id=== one.id?'badge-success':'badge-light'" @click="setParam('model',one)">{{one.sku}}</span>
                        </div>
                    </div>
                    <div class="mt-4">
                        <button class="btn btn-success btn-square btn-block" :disabled="params.model == null" @click="makeSale">{{lang.decide}}</button>
                    </div>
                </div>
            </div>
        </div>
        <div v-if="paymentProcessing">
            <payment :item="item" :settings="params" :paymentProcessing.sync="paymentProcessing"></payment>
        </div>
    </v-ons-page>
</template>

<script>
    import {requestSend} from "@/js/common";
    import config from "@/config";
    import constants from "@/js/constants";
    import locale from "@/js/locale";
    import router from "@/router";
    import StarRating from 'vue-star-rating';
    import Payment from "@/pages/paymentPage";
    import Vue from 'vue'
    import VueZoomer from 'vue-zoomer'
    Vue.use(VueZoomer);

    export default {
        components: {
            StarRating,
            Payment,
        },
        data() {
            return {
                loading: false,
                id: '',
                carouselIndex: 0,
                item: null,
                navbarActive: false,
                isScrolling: false,
                showScrollTop:false,
                images: [],
                takingOrder:false,
                params:{
                    model:null,
                    required_service:true,
                },
                paymentProcessing:false
            }
        },
        methods: {
            handleScroll(event) {
                this.isScrolling = (this.$refs.rootDetail.scrollTop > 3)
                this.showScrollTop = (this.$refs.rootDetail.scrollTop > 200)
            },
            scrollToTop() {
                this.intervalScroll = setInterval(() => {
                    if(this.$refs.rootDetail.scrollTop <= 0){
                        clearInterval(this.intervalScroll)
                    }
                    this.$refs.rootDetail.scrollTop -= 50;
                },20)
            },
            getData() {
                this.loading = true
                this.images = []
                this.carouselIndex = 0;
                requestSend(config.API_URL + 'product/detail/' + this.id).then((resp => {
                    if (resp.status === constants.RES_SUCCESS) {
                        this.item = resp.result
                        this.images.push(this.item.main_photo);
                        /*const photos = this.item.photos.map(resp => {
                            return resp.path;
                        });
                        this.images = this.images.concat(photos)*/

                    }
                    this.loading = false
                }))
            },
            gotoProduct(id) {
                router.push('/product-detail/' + id);
                this.id = id;
                this.getData();
                this.scrollToTop()
            },
            takeOrder() {
                this.takingOrder = true
            },
            setParam(field,value = null) {
                if(field === 'required_service') {
                    this.params.required_service = !this.params.required_service
                } else {
                    this.params.model = value
                }
            },
            makeSale() {
                this.takingOrder = false;
                this.paymentProcessing = true;
            }
        },
        created() {
            this.lang = locale
            this.constants = constants
            this.id = this.$route.params.id;
            this.getData()
        },
        watch: {
            'isScrolling': function (newVal) {
                this.navbarActive = newVal
            }
        }
    }
</script>
