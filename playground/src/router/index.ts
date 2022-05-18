import Vue from "vue";
import VueRouter, { RouteConfig } from "vue-router";

Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
  {
    path: "/:component",
    name: "editor",
    component: () => import("../views/Editor.vue"),
  },
  {
    path: "*",
    name: "editor",
    component: () => import("../views/Editor.vue"),
  },
  // {
  //   path: "*",
  //   name: "mdviewer",
  //   component: () => import("../views/MDViewer.vue"),
  // },
];

const router = new VueRouter({
  mode: "hash",
  base: process.env.BASE_URL,
  routes,
});

export default router;
