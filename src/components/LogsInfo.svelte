<svelte:options tag="tf-logs-info" />

<script lang="ts">
  const currentDeployment = window.configs.currentDeploymentStore;
  $: logs = $currentDeployment;
</script>

{#if logs && logs.message}
  <div
    class="notification is-info"
    style="
position: fixed; 
bottom: 15px; 
left: 15px;
z-index: 9999;
"
  >
    <p>
      Logs of deployment with name <strong>{logs.name}</strong> of type
      <strong>{logs.type}</strong>
    </p>
    {logs.message}
  </div>
{/if}
