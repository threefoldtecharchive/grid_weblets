<svelte:options tag="tf-alert" />

<script lang="ts">
  export let type: "info" | "success" | "danger";
  export let message: string;
  export let gateway: string;
  export let planetaryIP: string;
</script>

<div class={"notification is-" + type}>
  {message}
  <hr />
  <h3>Deployment Info:</h3>
  <p>- Gateway: https://{gateway}/</p>
  <p>- Planetary IP: {planetaryIP}</p>
</div>

<style lang="scss" scoped>
  @import url("https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css");
  ul {
    list-style: circle;
  }
  h3 {
    font-weight: bold;
  }
</style>
