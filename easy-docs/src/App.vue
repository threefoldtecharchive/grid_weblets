<template>
  <main>
    <script
      v-for="el in elements"
      :key="el"
      type="application/javascript"
      :src="`/easy-docs/build/elements/${el}.wc.js`"
      defer
    ></script>

    <!-- <section class="app-container" v-if="sidenav">
      <Sidenav :routes="sidenav" :activeRoute="$store.getters.activeRoute" />
    </section> -->
    <router-view />

    <!-- <p v-if="!sidenav">Loading...</p> -->
  </main>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import Sidenav from "@/components/Sidenav.vue";
import api from "@/utils/api";
import { ISidenav } from "@/types/Sidenav";
import { Route } from "vue-router";
import { findInitialPage } from "@/utils/sidenav";

@Component({
  name: "App",
  components: {
    Sidenav,
  },
})
export default class App extends Vue {
  elements = [
    "base",
    "kubernetes",
    "vm",
    "deployedlist",
    "caprover",
    "farmingcalculator",
  ];
  sidenav: ISidenav | null = null;

  created() {
    // api
    //   .get<ISidenav>("/sidenav.json")
    //   .then((r) => (this.sidenav = r.data))
    //   .catch(console.log);
  }

  @Watch("$route", { immediate: true, deep: true })
  onRouteChange(route: Route) {
    if (this.sidenav) {
      this.$store.dispatch("setActiveRoute", route.path);
      this.$store.dispatch(
        "setActivePage",
        findInitialPage(this.sidenav as any, route.path)
      );
    }

    /* Load new page */
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  padding-left: 300px;
}
</style>
