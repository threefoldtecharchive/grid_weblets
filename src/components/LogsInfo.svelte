<svelte:options tag="tf-logs-info" />

<script lang="ts">
  const currentDeployment = window.configs.currentDeploymentStore;
  $: logs = $currentDeployment;
</script>

{#if logs && logs.message}
  <div
    style="
position: fixed; 
bottom: 15px; 
left: 15px; 
padding: 20px; 
border: 1px solid #ccc;
background-color: white;
color: #333;
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
