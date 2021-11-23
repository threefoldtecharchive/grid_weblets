<svelte:options tag="tf-kubernetes" />

<script lang="ts">
  const { events } = window.configs?.grid3_client ?? {};
  const deploymentStore = window.configs?.deploymentStore;
  import Kubernetes, { Worker } from "../../types/kubernetes";
  import deployKubernetes from "../../utils/deployKubernetes";
  import type { IFormField, ITab } from "../../types";
  import type { IProfile } from "../../types/Profile";

  // Components
  import Inputs from "../../components/Inputs.svelte";
  import Tabs from "../../components/Tabs.svelte";
  import SelectProfile from "../../components/SelectProfile.svelte";
  import Alert from "../../components/Alert.svelte";
  import NodesContainer from "../../components/NodesContainer.svelte";

  // prettier-ignore
  const tabs: ITab[] = [
    { label: "Config", value: "config" },
    { label: "Network", value: "network" },
    { label: "Master", value: "master" },
    { label: "Workers", value: "workers" },
  ];

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

  let data = new Kubernetes();

  let active: string = "config";
  let loading = false;
  let success = false;
  let failed = false;
  let profile: IProfile;
  let message: string;
  $: disabled = ((loading || !data.valid) && !(success || failed)) || !profile || profile.mnemonics === "" || profile.storeSecret === ""; // prettier-ignore

  function onDeployKubernetes() {
    loading = true;
    success = false;
    failed = false;
    message = undefined;

    const onLogInfo = (msg: string) => typeof msg === "string" ? (message = msg) : null; // prettier-ignore
    events.addListener("logs", onLogInfo);

    console.log(data);
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

  function onResetHandler(e: Event) {
    if (success || failed) {
      e.preventDefault();
      success = false;
      failed = false;
      loading = false;
    }
  }

  requestAnimationFrame(() => (data.sshKey = profile?.sshKey));
</script>

<div style="padding: 15px;">
  <form on:submit|preventDefault={onDeployKubernetes} class="box">
    <h4 class="is-size-4">Deploy a Kubernetes</h4>
    <hr />

    {#if loading}
      <Alert type="info" message={message || "Loading..."} />
    {:else if success}
      <Alert type="success" message="Successfully deployed K8S." />
    {:else if failed}
      <Alert type="danger" message={message || "Failed to deploy K8S."} />
    {:else}
      <SelectProfile on:profile={({ detail }) => (profile = detail)} />
      <Tabs bind:active {tabs} />

      {#if active === "config"}
        <Inputs bind:data fields={kubernetesFields} />
      {:else if active === "network"}
        <Inputs bind:data={data.network} fields={networkFields} />
      {:else if active === "master"}
        <Inputs bind:data={data.master} fields={baseFields} />
      {:else if active === "workers"}
        <NodesContainer
          bind:nodes={data.workers}
          fields={baseFields}
          on:click={() => (data.workers = [...data.workers, new Worker()])}
        />
      {/if}
    {/if}

    <div class="is-flex is-justify-content-flex-end is-align-items-center">
      <button
        class={"button is-primary " + (loading ? "is-loading" : "")}
        type="submit"
        {disabled}
        on:click={onResetHandler}
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

<!-- </Layout> -->
<style lang="scss" scoped>
  @import url("https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css");
</style>
