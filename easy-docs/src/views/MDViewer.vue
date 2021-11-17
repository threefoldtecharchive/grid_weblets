<template>
  <section class="viewer">
    <!-- works - {{ $store.getters.activeRoute }} - {{ $store.getters.activePage }} -->
    <p v-if="loading">Loading...</p>
    <div v-if="!loading" v-html="html" />
  </section>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import api from "@/utils/api";
import { parse } from "marked";
import fm from "front-matter";

@Component({
  name: "MDViewer",
})
export default class MDViewer extends Vue {
  html = "";
  loading = true;

  get path(): string {
    return this.$store.getters.activePage;
  }

  @Watch("path", { immediate: true })
  onPathChange(path: string) {
    this.loading = true;
    api
      .get(path)
      .then(({ data }) => {
        const { attributes, body } = fm(data);
        document.title = (attributes as any).title;
        this.html = parse(body, {
          sanitize: false,
        });
      })
      .catch(console.log)
      .finally(() => (this.loading = false));
  }
}
</script>

<style lang="scss" scoped>
.viewer {
  padding: 15px;
  height: 100vh;
  width: 100%;
  overflow-x: hidden;
  overflow-y: auto;
  will-change: transform;

  &::-webkit-scrollbar {
    width: 10px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #d3d3d3;
  }
}
</style>
