<template>
  <v-ons-page class="bg-1 product-page">
    <div>
      <div class="product-item" v-for="product in products">
        <router-link :to="{path: '/product-detail/' + product.id}">
          <div class="img">
            <img :src="product.main_photo" />
          </div>
          <div class="cont flex-grow-1 d-flex flex-column">
            <label class="title flex-grow-1">{{product.name  | truncate(70, '...')}}</label>
            <div>
              <span class="category">#{{product.category.name}}</span><br>
              <span class="currency text-danger">&yen;</span> <span class="amount">{{ product.items[0].price | currency}}</span>
              <span v-if="product.items.length > 1 && product.items[product.items.length - 1].price !== product.items[0].price " class="currency text-danger"> ~ &yen;</span> <span class="amount">{{ product.items[product.items.length - 1].price | currency}}</span>
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
        products:[],
        totalCount:0
      }
    },
    methods:{
      getList() {
        this.loading = true
        requestSend(config.API_URL+'product/filter',{page:this.page,length:8}).then((resp =>{
          if(resp.status === constants.RES_SUCCESS) {
            self.products = resp.items;
            self.totalCount = resp.total
          }
        }))
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
