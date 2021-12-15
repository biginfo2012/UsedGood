<template>
  <v-ons-page class="bg-1 product-page">
    <div>
      <div class="product-item" v-for="product in products">
        <router-link :to="{path: '/product-detail/' + product.id}">
          <div class="img">
            <img src="../assets/logo/logo.png" />
          </div>
          <div class="cont flex-grow-1 d-flex flex-column">
            <label class="title flex-grow-1">상품명</label>
            <div>
              <span class="category">#카테고리</span><br>
              <span class="currency text-danger">&yen;</span> <span class="amount">{{ 1000 | currency}}</span>
              <span class="currency text-danger"> ~ &yen;</span> <span class="amount">{{ 300 | currency}}</span>
            </div>
          </div>
        </router-link>
      </div>
    </div>
  </v-ons-page>
</template>
<script>

  import config from "@/config";
  import {requestSend} from "@/js/common";
  import constants from "@/js/constants";
  let self;

  export default {
    data() {
      return {
        loading:false,
        page:0,
        products:[
          {id: 1},
          {id: 2},
          {id: 3}
        ],
        totalCount:3
      }
    },
    methods:{
      getList() {
        //this.loading = true
        // requestSend(config.API_URL+'product/filter',{page:this.page,length:8}).then((resp =>{
        //   if(resp.status === constants.RES_SUCCESS) {
        //     self.products = resp.items;
        //     self.totalCount = resp.total
        //   }
        // }))
      },

    },
    computed: {
      //
    },
    created() {
      this.getList()
      self = this
    }
  }
</script>
