import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    activeRoute: "/",
    activePage: "/",
  },
  getters: {
    activeRoute: state => state.activeRoute,
    activePage: state => state.activePage,
  },
  mutations: {},
  actions: {
    setActiveRoute({ state }, activeRoute: string) {
      state.activeRoute = activeRoute;
    },
    setActivePage({ state }, activePage: string) {
      state.activePage = activePage;
    },
  },
  modules: {},
});
