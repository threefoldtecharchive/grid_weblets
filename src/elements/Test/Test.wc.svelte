<svelte:options tag="tf-kubernetes" />

<script lang="ts">
  import Inputs from "../../components/Inputs.svelte";
  import Kubernetes, { Worker } from "../../types/kubernetes";
  import deployKubernetes from "../../utils/deployKubernetes";
  const { events } = window.configs?.grid3_client ?? {};
  import type { IFormField, ITab } from "../../types";
  import SelectProfile from "../../components/SelectProfile.svelte";
  import type { IProfile } from "../../types/Profile";
  import Tabs from "../../components/Tabs.svelte";
  import Alert from "../../components/Alert.svelte";
  import NodesContainer from "../../components/NodesContainer.svelte";

  let data = new Kubernetes();

  // prettier-ignore
  const kubernetesFields: IFormField[] = [
    { label: "Name", symbol: "name", placeholder: "Your K8S Name", type: "text" },
    { label: "Cluster Token", symbol: "secret", placeholder: "Your Cluster Token", type: "text" },
    { label: "Public SSH Key", symbol: "sshKey", placeholder: "Your Public SSH Key", type: "text" },
    { label: "Metadata", symbol: "metadata", placeholder: "Your Metadata", type: "text" },
    { label: "Description", symbol: "description", placeholder: "Your Description", type: "textarea" },
  ];

  // prettier-ignore
  const networkFields: IFormField[] = [
    { label: "Network Name", symbol: "name", placeholder: "Your Network Name", type: "text" },
    { label: "Network IP Range", symbol: "ipRange", placeholder: "Your Network IP Range", type: "text" },
  ];

  // prettier-ignore
  const baseFields: IFormField[] = [
    { label: "Name", symbol: "name", placeholder: "Enter name", type: "text" },
    { label: "CPU", symbol: "cpu", placeholder: "CPU", type: 'number' },
    { label: "Memory", symbol: "memory", placeholder: "Memory in MB", type: 'number' },
    { label: "Disk Size", symbol: "diskSize", placeholder: "Disk size in GB", type: 'number' },
    { label: "Public IP", symbol: "publicIp", type: 'checkbox' },
    { label: "Plantery Network", symbol: "plantery", placeholder: "", type: 'checkbox' },
    { label: "Node ID", symbol: "node", placeholder: "Node ID", type: 'number' },
    { label: "Root FS Size", symbol: "rootFsSize", placeholder: "Root File System Size", type: 'number' },
  ];

  // prettier-ignore
  const tabs: ITab[] = [
    { label: "Config", value: "config" },
    { label: "Master", value: "master" },
    { label: "Workers", value: "workers" },
  ];
  let active: string = "config";

  let loading = false;
  let success = false;
  let failed = false;
  const deploymentStore = window.configs?.deploymentStore;

  let profile: IProfile;
  requestAnimationFrame(() => {
    data.sshKey = profile?.sshKey;
  });

  let message: string;
  function onDeployKubernetes() {
    loading = true;
    success = false;
    failed = false;
    message = undefined;

    function onLogInfo(msg: string) {
      if (typeof msg === "string") {
        message = msg;
      }
    }

    events.addListener("logs", onLogInfo);

    deployKubernetes(data, profile)
      .then(() => {
        deploymentStore.set(0);
        success = true;
      })
      .catch((err: Error) => {
        failed = true;
        message = err.message;
      })
      .finally(() => {
        loading = false;
        events.removeListener("logs", onLogInfo);
      });
  }
</script>

<div style="padding: 15px;">
  <form on:submit|preventDefault={onDeployKubernetes} class="box">
    <h4 class="is-size-4">Deploy a Kubernetes</h4>
    <hr />

    {JSON.stringify(data)}

    {#if loading}
      <Alert type="info" message={message || "Loading..."} />
    {:else if success}
      <Alert type="success" message="Successfully deployed K8S." />
    {:else if failed}
      <Alert type="danger" message={message || "Failed to deploy K8S."} />
    {:else}
      <SelectProfile bind:profile />
      <Tabs bind:active {tabs} />

      {#if active === "config"}
        <!-- Show Base Info -->
        <Inputs bind:data fields={kubernetesFields} />

        <!-- Network info -->
        <Inputs bind:data={data.network} fields={networkFields} />
      {/if}

      {#if active === "master"}
        <!-- Show Master Info -->
        <Inputs bind:data={data.master} fields={baseFields} />
      {/if}

      {#if active === "workers"}
        <!-- Show Workers Info -->
        <NodesContainer
          bind:nodes={data.workers}
          fields={baseFields}
          on:click={() => (data.workers = [...data.workers, new Worker()])}
        />
      {/if}
    {/if}

    <div class="actions">
      <button
        class={"button is-primary " + (loading ? "is-loading" : "")}
        type="submit"
        disabled={((loading || !data.valid) && !(success || failed)) ||
          !profile ||
          profile.mnemonics === "" ||
          profile.storeSecret === ""}
        on:click={(e) => {
          if (success || failed) {
            e.preventDefault();
            success = false;
            failed = false;
            loading = false;
          }
        }}
      >
        {#if success || failed}
          Back
        {:else}
          Deploy
        {/if}
      </button>
    </div>
  </form>
</div>

<style lang="scss" scoped>
  @import url("https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css");
</style>
