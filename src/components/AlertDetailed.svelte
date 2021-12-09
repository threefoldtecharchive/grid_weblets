<svelte:options tag="tf-alert" />

<script lang="ts">
  export let type: "info" | "success" | "danger";
  export let message: string;
  export let domain: string;
  export let planetaryIP: string;
  export let deployed: boolean = false;
</script>

<div class={"notification is-" + type}>
  {message}
  <hr />
  <h3 style="font-weight: bold;">Deployment Info:</h3>
  <ul class="ml-2">
    <li>
      Domain: <a href={`https://${domain}/`} target="_blank">
        https://{domain}/
      </a>
    </li>
    <li>Planetary IP: {planetaryIP}</li>
  </ul>
</div>
{#if deployed}
  <div class="notification is-info">
    Your solution is now starting. Please be patient
  </div>
{/if}
