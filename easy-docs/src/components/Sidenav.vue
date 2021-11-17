<template>
  <nav class="sidenav">
    <aside class="menu">
      <template v-for="route in routes">
        <p :key="route.label" class="menu-label">
          {{ route.label }}
        </p>

        <SidenavRoute
          :key="route.label + '/children'"
          :activeRoute="activeRoute"
          :routes="route.children"
        />
      </template>
    </aside>
  </nav>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { ISidenav } from "@/types/Sidenav";
import SidenavRoute from "@/components/SidenavRoute.vue";

@Component({
  name: "Sidenav",
  components: {
    SidenavRoute,
  },
})
export default class Sidenav extends Vue {
  @Prop({ required: true }) routes!: ISidenav;
  @Prop({ required: true }) activeRoute!: string;
}
</script>

<style lang="scss" scoped>
.sidenav {
  position: fixed;
  top: 0;
  left: 0;
  width: 300px;
  height: 100vh;
  padding: 15px;
  overflow-x: hidden;
  overflow-y: auto;
  border-right: 1px solid #e8e8e8;
  will-change: transform;

  &::-webkit-scrollbar {
    width: 10px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #d3d3d3;
  }
}
</style>
