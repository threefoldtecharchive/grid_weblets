<svelte:options tag="tf-import" />

<script lang="ts">
  import { parse } from "marked";
  import { onMount } from "svelte";

  export let path: string;

  let html: string;
  let loading = true;

  onMount(() => {
    fetch(path)
      .then(res => res.text())
      .then(md => {
        return parse(md, {
          sanitize: false,
        });
      })
      .then(_ => (html = _))
      .catch(err => console.log("Error", err))
      .finally(() => (loading = false));
  });
</script>

{#if loading}
  <p style="text-align: center;">Loading page content.</p>
{:else if html}
  {@html html}
{:else}
  <p style="text-align: center;">Failed to load page content.</p>
{/if}

<style lang="scss" scoped>
  @import url("https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css");
</style>
