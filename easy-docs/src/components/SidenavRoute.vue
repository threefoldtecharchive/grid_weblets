<template>
  <ul class="menu-list">
    <li v-for="route in routes" :key="route.to">
      <a
        v-bind:class="{ 'is-active': activeRoute === route.to }"
        @click="navigate(route)"
      >
        {{ route.label }}</a
      >
      <SidenavRoute
        :activeRoute="activeRoute"
        :routes="route.children"
        v-if="route.children && route.children.length"
      />
    </li>
  </ul>
</template>

<script lang="ts">
import { ISidenavRoute } from "@/types/Sidenav";
import { Component, Prop, Vue } from "vue-property-decorator";

@Component({
  name: "SidenavRoute",
})
export default class SidenavRoute extends Vue {
  @Prop({ required: true }) routes!: ISidenavRoute[];
  @Prop({ required: true }) activeRoute!: string;

  public navigate({ to }: ISidenavRoute): void {
    if (this.activeRoute !== to) {
      this.$router.push(to);
    }
  }
}
</script>
