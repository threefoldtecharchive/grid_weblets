<svelte:options tag="tf-kubernetes" />

<script lang="ts">
  const { events } = window.configs?.grid3_client ?? {};
  const deploymentStore = window.configs?.deploymentStore;
  import Kubernetes, { Worker } from "../../types/kubernetes";
  import deployKubernetes from "../../utils/deployKubernetes";
  import type { IFormField, ITab } from "../../types";
  import type { IProfile } from "../../types/Profile";

  // Components
  import Input from "../../components/Input.svelte";
  import Tabs from "../../components/Tabs.svelte";
  import SelectProfile from "../../components/SelectProfile.svelte";
  import Alert from "../../components/Alert.svelte";
  import DeleteBtn from "../../components/DeleteBtn.svelte";
  import AddBtn from "../../components/AddBtn.svelte";
  import DeployBtn from "../../components/DeployBtn.svelte";
  import SelectNodeId from "../../components/SelectNodeId.svelte";

  // prettier-ignore
  const tabs: ITab[] = [
    { label: "Config", value: "config" },
    { label: "Master", value: "master" },
    { label: "Workers", value: "workers" },
  ];

  // prettier-ignore
  const kubernetesFields: IFormField[] = [
    { label: "Name", symbol: "name", placeholder: "Your K8S Name", type: "text" },
    { label: "Cluster Token", symbol: "secret", placeholder: "Cluster Token", type: "text" },
    { label: "Public SSH Key", symbol: "sshKey", placeholder: "Public SSH Key", type: "text" },
    // { label: "Metadata", symbol: "metadata", placeholder: "Metadata", type: "text" },
    // { label: "Description", symbol: "description", placeholder: "Description", type: "textarea" },
  ];

  // prettier-ignore
  const networkFields: IFormField[] = [
    { label: "Network Name", symbol: "name", placeholder: "Network Name", type: "text" },
    { label: "Network IP Range", symbol: "ipRange", placeholder: "Network IP Range", type: "text" },
  ];

  // prettier-ignore
  const baseFields: IFormField[] = [
    { label: "Name", symbol: "name", placeholder: "Cluster instance name", type: "text" },
    { label: "CPU", symbol: "cpu", placeholder: "CPU cores", type: 'number' },
    { label: "Memory (MB)", symbol: "memory", placeholder: "Memory in MB", type: 'number' },
    { label: "Disk Size (GB)", symbol: "diskSize", placeholder: "Disk size in GB", type: 'number' },
    { label: "Public IP", symbol: "publicIp", type: 'checkbox' },
    { label: "Planetary Network", symbol: "planetary", placeholder: "Enable planetary network", type: 'checkbox' },
    // { label: "Node ID", symbol: "node", placeholder: "Node ID", type: 'number' },
    { label: "Root FS Size (GB)", symbol: "rootFsSize", placeholder: "Root File System Size in GB", type: 'number' },
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
      <SelectProfile
        on:profile={({ detail }) => {
          profile = detail;
          data.sshKey = detail.sshKey;
        }}
      />
      <Tabs bind:active {tabs} />

      {#if active === "config"}
        {#each kubernetesFields as field (field.symbol)}
          <Input bind:data={data[field.symbol]} {field} />
        {/each}
        {#each networkFields as field (field.symbol)}
          <Input bind:data={data.network[field.symbol]} {field} />
        {/each}
      {:else if active === "master"}
        {#each baseFields as field (field.symbol)}
          <Input bind:data={data.master[field.symbol]} {field} />
        {/each}
        <SelectNodeId bind:data={data.master.node} {profile} />
      {:else if active === "workers"}
        <AddBtn
          on:click={() => (data.workers = [...data.workers, new Worker()])}
        />
        <div class="nodes-container">
          {#each data.workers as worker, index (worker.id)}
            <div class="box">
              <DeleteBtn
                name={worker.name}
                on:click={() =>
                  (data.workers = data.workers.filter((_, i) => index !== i))}
              />
              {#each baseFields as field (field.symbol)}
                <Input bind:data={worker[field.symbol]} {field} />
              {/each}
              <SelectNodeId bind:data={worker.node} {profile} />
            </div>
          {/each}
        </div>
      {/if}
    {/if}

    <DeployBtn
      {disabled}
      {loading}
      {failed}
      {success}
      on:click={onResetHandler}
    />
  </form>
</div>

<!-- </Layout> -->
<style lang="scss" scoped>
  @import url("https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css");
  @import "../../assets/global.scss";
</style>
