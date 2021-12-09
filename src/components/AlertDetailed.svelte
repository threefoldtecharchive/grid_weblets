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
  <h3 style="font-weight: bold;">Deployment Info:</h3>
  <ul class="ml-2">
    <li>
      Domain: <a href={`https://${gateway}/`} target="_blank">
        https://{gateway}/
      </a>
    </li>
    <li>Planetary IP: {planetaryIP}</li>
  </ul>
</div>
