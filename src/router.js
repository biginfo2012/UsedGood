import Vue from 'vue';

import Router from 'vue-router';
import profilePage from "@/pages/profilePage";
import loginPage from "@/pages/loginPage";
import registerPage from "@/pages/registerPage";
import mainPage from "@/pages/mainPage";
import productDetail from "@/pages/productDetail";
import productFilter from "@/pages/filterPage";
import notifyDetailPage from "@/pages/notifyDetailPage";
import orderPage from "@/pages/orderPage";
import orderDetailPage from "@/pages/orderDetailPage";
import orderAddPage from "@/pages/orderAddPage";
import orderReviewPage from "@/pages/orderReviewPage";
import forgotPassPage from "@/pages/forgotPassPage";
import {modelCheckbox} from "vue-onsenui/esm/mixins";

Vue.use(Router);

const router = new Router({
  routes: [
    {
      path: '/',
      name: 'home',
      component: loginPage,
    },
    {
      path: '/home',
      name: 'home-page',
      component: mainPage,
      meta:{
        auth:true,
        index:0
      },
    },
    {
      path: '/product',
      name: 'product',
      component: mainPage,
      children:[
        {
          path: '/product-filter',
          name: 'productFilter',
          component: productFilter,
        },
        {
          path: '/product-detail/:id',
          name: 'productDetail',
          component: productDetail,
        },
      ],
      meta:{
        auth:true,
        index:1
      },
    },
    {
      path: '/notify',
      name: 'notify',
      component: mainPage,
      children: [
        {
          path: '/notify-detail/:id',
          name: 'notifyDetail',
          component: notifyDetailPage,
        }
      ],
      meta:{
        auth:true,
        index:2
      },
    },
    {
      path: '/my',
      name: 'my',
      component: mainPage,
      children:[
        {
          path: '/order/:index',
          name: 'order',
          component: orderPage,
          children:[
            {
              path: '/order-detail/:id',
              name: 'orderDetail',
              component: orderDetailPage,
            },
            {
              path: '/order-rating/:id',
              name: 'orderRating',
              component: orderReviewPage,
            },

          ]
        },
        {
          path: '/order-manage/:id/:type',
          name: 'orderManage',
          component: orderAddPage,
        },
        {
          path: '/profile',
          name: 'Profile',
          component: profilePage,
        },
      ],
      meta:{
        auth:true,
        index:3
      },
    },
    {
      path: '/login',
      name: 'Login',
      component: loginPage,
    },
    {
      path: '/register',
      name: 'Register',
      component: registerPage,
    },
    {
      path: '/forgot-pass',
      name: 'forgotPass',
      component: forgotPassPage,
    },

  ]
});

router.beforeEach((to,from,next) => {
  if (to.matched.some(record => record.meta.auth)) {
    // this route requires auth, check if logged in
    // if not, redirect to login page.
    const token = localStorage.getItem('token');
    if (token === null) {
      //next({ name: 'Login' })
      next()
    } else {
      next() // go to wherever I'm going
    }
  } else {
    next() // does not require auth, make sure to always call next()!
  }
})
/* For Vuex
 *
 * import store from 'store.js';
 *
 * router.beforeEach((to, from, next) => {
 *   // Reset pageStack to the new route
 *   store.commit('navigator/resetStack', to.matched.map(m => m.components.default));
 *   next();
 * });
 */

export default router;
