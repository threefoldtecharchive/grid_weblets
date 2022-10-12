<svelte:options tag="tf-logs-info" />

<script lang="ts">
  import type { IStore } from "../stores/currentDeployment";

  const currentDeployment = window.configs.currentDeploymentStore;
  $: logs = $currentDeployment;

  function getMessage({ type, name }: IStore): string {
    const s = (m: string) => `<strong>${m}</strong>`;

    switch (type) {
      case "Add Worker":
        return `Logs of ${s("Adding Worker")} with name ${s(name)}`;
      case "Remove Worker":
        return `Logs of ${s("Removing Worker")} with name ${s(name)}`;

      case "VM":
      case "CapRover":
      case "Funkwhale":
      case "Kubernetes":
      case "Peertube":
      case "Owncloud":
      case "Fullvm":
      case "Algorand":
      case "GatewayName":
        return `Logs of Deployment of type ${s(type)} with name ${s(name)}`;

      case "Deleting Deployment":
        return `Logs of ${s(type)} with name ${s(name)}`;

      default:
        return "Logs";
    }
  }
</script>

{#if logs && logs.message}
  <div
    class="notification"
    style="
position: fixed; 
bottom: 15px; 
left: 15px;
z-index: 9999;
background-color: #1982b1; 
color: white
"
  >
    <p>
      {@html getMessage(logs)}
    </p>
    {logs.message}
  </div>
{/if}
