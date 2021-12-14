import Vue from "vue";
import Vuex from "vuex";
Vue.use(Vuex);
const store = new Vuex.Store({
    state:{
        user: localStorage.getItem('user'),
        token:localStorage.getItem('token')
    },
    mutations: {
        setUser (user) {
            this.state.user = user
        }
    }
});

export default store;