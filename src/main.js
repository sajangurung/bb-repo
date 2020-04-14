import Vue from 'vue';
import VueAxios from 'vue-axios';
import VueRouter from 'vue-router';
import axios from './axios';
import App from './App.vue';
import RepoList from './components/RepoList.vue';

Vue.use(VueAxios, axios);
Vue.use(VueRouter);
Vue.config.productionTip = false;

const router = new VueRouter({
  routes: [{ name: 'repo', path: 'repo/:pageIndex', component: RepoList }],
});

new Vue({
  router,
  render: (h) => h(App),
}).$mount('#app');
