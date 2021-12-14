<template>
    <v-ons-page class="bg-white product-page filter-page" v-bind:class="loading?'loading':''">
        <div class="content" ref="rootDetail" @scroll="handleScroll">
            <div class="static-toolbar">
                <div class="filter-wrapper w-100 d-flex px-1  align-items-center" id="navbar">
                    <router-link class="back-button text-dark pl-2 pr-3" :to="{path: '/product'}"><span
                            class="ion-chevron-left"></span></router-link>
                    <div class="filter-input form-group mb-0 flex-grow-1 position-relative">
                        <input class="form-control" v-model="keyword" @focus="searchDone = false">
                        <span v-if="keyword !== ''" class="position-absolute text-danger "
                              @click="keyword = '';searchDone = false"><i
                                class="fa fa-times-circle"></i> </span>
                    </div>
                    <span v-if="!searchDone" @click="searchWithKeyword" class="font-size-13 pr-1 pl-3">{{lang.filter_product}}</span>
                </div>
                <div v-if="searchDone">
                    <div class="sort-wrapper pt-1 pb-2 d-flex justify-content-around">
                        <div @click="setSort('sold')" :class="sort.field=== 'sold'?'active':''"><span>{{lang.sale_count}}</span>
                            <span class="d-flex flex-column sort">
                              <i class="fa fa-caret-up" :class="sort.dir?'active':''"></i>
                              <i class="fa fa-caret-down"  :class="sort.dir?'':'active'"></i>
                            </span>
                        </div>
                        <div @click="setSort('price')" :class="sort.field=== 'price'?'active':''"><span>{{lang.price}}</span>
                            <span class="d-flex flex-column sort">
                              <i class="fa fa-caret-up" :class="sort.dir?'active':''"></i>
                              <i class="fa fa-caret-down"  :class="sort.dir?'':'active'"></i>
                            </span>
                        </div>
                        <div class="filter-btn" :class="showCustomFilter?'active':''" @click="showCustomFilter = !showCustomFilter"><span>{{lang.filter}}</span><span
                                class="fa fa-filter text-muted"></span></div>
                    </div>
                    <div class="custom-filter pt-3 d-flex flex-column " v-if="showCustomFilter">
                        <div class="filter">
                            <label>{{lang.product_category}}</label>
                            <div class="ml-1 px-1">
                                <span class="badge" @click="params.category = ''" :class="params.category === ''?'badge-success':'badge-light'">{{lang.all}}</span>
                                <span class="badge" @click="params.category = category.id"
                                      v-for="category in categorys"
                                      :class="params.category === category.id?'badge-success':'badge-light'">{{ category.name}}</span>
                            </div>
                        </div>
                        <div class="filter">
                            <label>{{lang.price_field}}(&yen;)</label>
                            <div class="ml-1 px-1">
                                <span class="badge" @click="params.priceGroup = ''" :class="params.priceGroup === ''?'badge-success':'badge-light'">{{lang.all}}</span>
                               <span class="badge" @click="params.priceGroup = group.value"
                                     v-for="group in priceGroups"
                                     :class="params.priceGroup === group.value?'badge-success':'badge-light'">{{ group.text}}</span>
                                <div class="form-group mb-0 d-flex align-items-center mt-1">
                                    <input class="form-control" :placeholder="lang.min_price" v-model="params.min">
                                    <span class="ion-minus text-muted mx-1 font-size-12"></span>
                                    <input class="form-control" :placeholder="lang.max_price" v-model="params.max">
                                </div>
                            </div>
                        </div>
                        <div class="action d-flex">
                            <button class="btn btn-block btn-light" @click="clearFilter">{{ lang.reset}}</button>
                            <button class="btn btn-block btn-success mt-0" @click="getDataWithFilter()">{{ lang.complete}}</button>
                        </div>
                        <div class="space flex-grow-1"></div>
                    </div>
                </div>
                <div v-else-if="!searchDone" class="recent-history pt-3 px-2">
                    <div class="d-flex justify-content-between">
                        <label class="text-muted"><span class="fa fa-clock"></span>
                            &nbsp;{{lang.recent_keywords}}</label>
                        <span class="fa fa-trash text-muted" @click="clearKeywordHistory"></span>
                    </div>

                    <div class="history-wrapper ml-1">
            <span class="badge badge-light" @click="searchWithHistory(one)"
                  v-for="one in keywordHistory">{{ one}}</span>
                    </div>
                </div>
            </div>
            <div class="mt-4">
                <div class="product-item" v-for="product in products">
                    <router-link :to="{path: '/product-detail/' + product.id}">
                        <div class="img">
                            <img :src="product.main_photo"/>
                        </div>
                        <div class="cont flex-grow-1 d-flex flex-column">
                            <label class="title flex-grow-1">{{product.name | truncate(70, '...')}}</label>
                            <div>
                                <span class="category">#{{product.category.name}}</span><br>
                                <span class="currency text-danger">&yen;</span> <span class="amount">{{ product.items[0].price | currency}}</span>
                                <span v-if="product.items.length > 1 && product.items[product.items.length - 1].price !== product.items[0].price " class="currency text-danger"> ~ &yen;</span>
                                <span class="amount">{{ product.items[product.items.length - 1].price | currency}}</span>
                            </div>
                        </div>
                    </router-link>
                </div>
                <div v-if="searchDone && products.length === 0" class="p-3">
                    <div class="separator">{{ lang.no_have_filter_product}}</div>
                </div>
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

    let self;
    Vue.filter('currency', function (value) {
        if (typeof value !== "number") {
            value = parseFloat(value)
        }
        var formatter = new Intl.NumberFormat('zh', {
            currency: 'CNY',
            minimumFractionDigits: 2
        });
        return formatter.format(value);
    });

    let filter = function (text, length, clamp) {
        clamp = clamp || '...';
        let node = document.createElement('div');
        node.innerHTML = text;
        let content = node.textContent;
        return content.length > length ? content.slice(0, length) + clamp : content;
    };

    Vue.filter('truncate', filter);

    export default {
      data() {
        return {
          loading: false,
          products: [],
          categorys: [],
          totalCount: 0,
          keyword: '',
          searchDone: false,
          keywordHistory: [],
          priceGroups: [
            {value: '0_1999', text: '0 - 1999'},
            {value: '2000_4999', text: '2000 - 4999'},
            {value: '5000_9999', text: '5000 - 9999'},
          ],
            showCustomFilter: false,
            sort: {
                field: '',
                dir: true,
                page: 0,
                length: 20,
            },
            params: {
                category: '',
                min: '',
                max: '',
                priceGroup: '',
            }
        }
      },
      methods: {
        getList() {
          this.loading = true;
          let params = this.params;
          params.keyword = this.keyword;
          params = Object.assign(params,this.sort);
          requestSend(config.API_URL + 'product/filter', params).then((resp => {
            if (resp.status === constants.RES_SUCCESS) {
              self.products = resp.items;
              self.totalCount = resp.total
            }
            this.loading = false
          }))
        },
        handleScroll(evt) {

        },
        searchWithKeyword() {
          if (this.keyword === '')
            return;
          this.searchDone = true
          this.keywordHistory.unshift(this.keyword)
          this.keywordHistory = Array.from(new Set(this.keywordHistory))
          this.getList()
        },
        clearFilter() {
          this.params = {
            category: '',
            min: '',
            max: '',
            priceGroup: null,
            page: 0,
            length: 20,
          };
          this.showCustomFilter = false
          this.getList()
        },
        getDataWithFilter() {
          this.showCustomFilter = false;
          this.getList()
        },
        searchWithHistory(value) {
          this.keyword = value;
          this.searchWithKeyword()
        },
        clearKeywordHistory() {
          this.keywordHistory = [];
        },
        getCategory() {
          requestSend(config.API_URL + 'category', {}, constants.METHOD_GET).then((resp => {
            this.categorys = resp
          }))
        },
        setSort(field) {
          if (this.sort.field === field)
            this.sort.dir = !this.sort.dir
          else {
            this.sort.field = field;
            this.sort.dir = true;
          }
          this.getList()
        }
      },
      computed: {
        //
      },
      created() {
        this.lang = locale;
        this.getCategory();
        let history = localStorage.getItem('keywords');
        if (history !== null) {
          this.keywordHistory = JSON.parse(history)
        }
        self = this
      },
      watch: {
        'keywordHistory': function (newVal) {
          localStorage.setItem('keywords', JSON.stringify(newVal))
        },
        'priceGroup': function (newVal) {
          this.params.min = ''
          this.params.max = ''
        },
        'searchDone':function (newVal) {
            if(!newVal) {
                this.products = [];
                this.params = {
                    category: '',
                    min: '',
                    max: '',
                    priceGroup: null,
                    page: 0,
                    length: 20,
                };
            }
        }
      }
    }
</script>
