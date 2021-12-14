<template>
  <v-ons-page class="bg-1 home-page">
    <div class="content" ref="rootDetail" @scroll="handleScroll">
      <div class="position-relative h-100">
        <div class="position-relative carousel-wrapper h-100">
          <v-ons-carousel fullscreen swipeable auto-scroll overscrollable auto-refresh
                          :index.sync="carouselIndex">
            <v-ons-carousel-item >
              <div class="carousel-content">
                <div class="position-absolute title">
                  <h3 class="carousel-title mb-3">创 想！ 创 产！<br><span class="text-right ml-5">感 恩！责 任！</span> </h3>
                  <h4 class="carousel-title text-right"><b>普泰科技</b>永恒的<br>追求</h4>
                </div>
                <img :src="config.ASSET_URL + 'apps/banners/ban1.jpg'"/>
              </div>
            </v-ons-carousel-item>
            <v-ons-carousel-item >
              <div class="carousel-content">
                <div class="position-absolute title">
                  <h3 class="carousel-title" style="font-size: 2rem">国家高新技术,<br><br><span class="text-right ml-5">中关村高新技术企业</span> </h3>
                </div>
                <img :src="config.ASSET_URL + 'apps/banners/ban2.jpg'"/>
              </div>
            </v-ons-carousel-item>
          </v-ons-carousel>
          <div class="position-absolute action-wrapper px-4 d-flex flex-column justify-content-between">
            <div>
              <button class="btn font-weight-bold btn-success btn-lg btn-square btn-block" @click="createOrder">{{ lang.create_order}}</button>
              <button class="btn btn-light btn-lg font-weight-bold btn-square btn-round px-4 btn-block" @click="goSale">{{ lang.buy_product }}</button>
            </div>
            <div class="text-center" ref="downUpBtn"><img @click="downScroll" :src="config.ASSET_URL + 'apps/icons/down-chevron.svg'" style="width: 2rem" class="down-up"/></div>
          </div>
        </div>
        <div>
          <div class="pt-2">
            <div class="d-flex flex-column align-items-center justify-content-center">
              <img :src="config.ASSET_URL + 'images/logos/logo.png'" width="200" />
              <h2 class="text-white mt-0" style="text-shadow: 1px 1px 1px black;">{{lang.company_name}}</h2>
            </div>
          </div>
          <div class="pt-2">
            <img :src="config.ASSET_URL + 'images/bg/plan.png'" class="w-100" />
          </div>
          <div class="business-wrapper p-3 px-4">
            <h2 class="title text-center mt-3 mb-1 text-success font-weight-bold">主营业务</h2>
            <h5 class="title text-center mb-4  text-uppercase text-muted">business</h5>
            <div class="item my-2 w-100 text-center d-flex bg-white flex-column">
              <div class="icon-wrapper">
                <img :src="config.ASSET_URL + 'images/icon/save_energy.svg'" class="icon"/>
              </div>
              <h5 class="item-title font-weight-bold mb-4">节能产品</h5>
              <p class="text-muted font-size-13">
                光电/热集成系统；空气源、地源、水源热泵；储热式电暖气/电锅炉、燃气壁挂炉/锅炉、甲醇锅炉/壁挂炉等。
              </p>
            </div>
            <div class="item my-2 w-100 text-center d-flex bg-white flex-column">
              <div class="icon-wrapper">
                <img :src="config.ASSET_URL + 'images/icon/environment.svg'" class="icon"/>
              </div>
              <h5 class="item-title font-weight-bold mb-4">环保产品</h5>
              <p class="text-muted font-size-13">
                工/农业废气处理系统；油气（ VOCs）回收系统；污水处理系统；植保系统等。
              </p>
            </div>
            <div class="item my-2 w-100 text-center d-flex bg-white flex-column">
              <div class="icon-wrapper">
                <img :src="config.ASSET_URL + 'images/icon/health.svg'" class="icon"/>
              </div>
              <h5 class="item-title font-weight-bold mb-4">健康产品</h5>
              <p class="text-muted font-size-13">
                民用集成消毒机、商用消毒机（有效防止包括肺炎病毒的各种有害病菌）
              </p>
            </div>
            <div class="item my-2 w-100 text-center d-flex bg-white flex-column">
              <div class="icon-wrapper">
                <img :src="config.ASSET_URL + 'images/icon/research.svg'" class="icon"/>
              </div>
              <h5 class="item-title font-weight-bold mb-4">现代服务</h5>
              <p class="text-muted font-size-13">
                合同能源管理、集中供暖服务（包括BOT)
              </p>
            </div>
          </div>
        </div>
        <div v-if="showScrollTop" class="scroll-top d-flex align-items-center justify-content-center flex-column" @click="scrollToTop">
          <span class="ion-chevron-up icon"></span>
          <span>{{lang.scroll_top}}</span>
        </div>
      </div>
      <div class="position-fixed residence-wrapper d-flex flex-column" v-bind:class="bindingType?'active':''">
        <div class="flex-grow-1"></div>
        <div class="px-2 bg-white pb-5">
          <div class="d-flex justify-content-end pt-2 mb-3">
            <span @click="bindingType = false" class="px-3 font-size-15em" ><i class="ion ion-android-close"></i> </span>
          </div>
          <div class=" w-100">
            <button type="button" v-for="one in categories" class="btn btn-block btn-outline-success" @click="goLink(one.id)">{{ one.name}}</button>
           <!-- <router-link v-for="one in categories" :to="{path: '/order-manage/null/' + one.id}" class="btn btn-block btn-outline-success">{{ one.name}}</router-link>-->
          </div>
        </div>
      </div>
    </div>
  </v-ons-page>
</template>
<script>

  import config from "@/config";
  import locale from "@/js/locale";
  import constants from "@/js/constants";
  import {requestSend} from "@/js/common";
  import router from "@/router";
  let self;

  export default {
    data() {
      return {
        loading:false,
        showScrollTop:false,
        bindingType:false,
        carouselIndex:0,
        page:0,
        images:[],
        categories:[]
      }
    },
    methods:{
      handleScroll(event) {
        this.showScrollTop = (this.$refs.rootDetail.scrollTop > 200)
      },
      downScroll() {
        this.$refs.rootDetail.scrollTop  = this.$refs.downUpBtn.getBoundingClientRect().bottom;

      },
      scrollToTop() {
        this.intervalScroll = setInterval(() => {
          if(this.$refs.rootDetail.scrollTop <= 0){
            clearInterval(this.intervalScroll)
          }
          this.$refs.rootDetail.scrollTop -= 50;
        },20)
      },
      goLink(line) {
        this.bindingType = false;
        router.push('/order-manage/null/' + line);
      },
      goSale() {
        this.$emit('update:index', 1)
      },
      createOrder() {
        this.bindingType = true;//:to="{path: '/order-manage/null'}"
      },
      getCategory() {
        requestSend(config.API_URL + 'category', {}, constants.METHOD_GET).then((resp => {
          this.categories = resp;
          localStorage.setItem('category', JSON.stringify(resp));
        }))
      },
    },
    computed: {
      //
    },
    created() {
      this.config = config;
      this.lang = locale;
      setInterval(() => {
        this.carouselIndex++;
        if(this.carouselIndex > 2)
          this.carouselIndex = 0
      },2000);
      this.getCategory();
      let categories = localStorage.getItem('category');
      if(categories === null || categories === '')
        this.getCategory();
      else
        this.categories = JSON.parse(categories);
    },
  }
</script>
