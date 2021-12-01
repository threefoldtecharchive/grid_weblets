<svelte:options tag="tf-alert" />

<script lang="ts">
  export let type: "info" | "success" | "danger";
  export let message: string;
  export let gateway: string;
  export let planetaryIP: string;
  export let info: Object;
</script>

<div class={"notification is-" + type}>
  {message}
  <hr />
  <h3 style="font-weight: bold;">Deployment Info:</h3>
  <ul style="list-style: circle;">
    <li>Gateway: https://{gateway}/</li>
    <li>Planetary IP: {planetaryIP}</li>
  </ul>
</div>
