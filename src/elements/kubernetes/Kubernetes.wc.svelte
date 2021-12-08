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
  import Modal from "../../components/DeploymentModal.svelte";
  import hasEnoughBalance from "../../utils/hasEnoughBalance";

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
    { label: "Root FS Size (GB)", symbol: "rootFsSize", placeholder: "Root File System Size in GB", type: 'number' },
  ];

  let data = new Kubernetes();

  let active: string = "config";
  let loading = false;
  let success = false;
  let failed = false;
  let profile: IProfile;
  let message: string;
  $: disabled = ((loading || !data.valid) && !(success || failed)) || !profile || data.master.status !== "valid" || data.workers.reduce((res, { status }) => res || status !== "valid", false); // prettier-ignore
  let modalData: Object;
  const configs = window.configs?.baseConfig;

  async function onDeployKubernetes() {
    loading = true;

    if (!hasEnoughBalance(profile)) {
      failed = true;
      loading = false;
      message =
        "No enough balance to execute transaction requires 2 TFT at least in your wallet.";
      return;
    }

    function onLogInfo(msg: string) {
      if (typeof msg === "string") {
        message = msg;
      }
    }

    success = false;
    failed = false;
    message = undefined;

    events.addListener("logs", onLogInfo);

    deployKubernetes(data, profile)
      .then((data) => {
        modalData = data;
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
          if (detail) {
            data.sshKey = detail.sshKey;
          }
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
        <SelectNodeId
          cpu={data.master.cpu}
          memory={data.master.memory}
          publicIp={data.master.publicIp}
          ssd={data.master.diskSize}
          bind:data={data.master.node}
          bind:nodeSelection={data.master.selection.type}
          filters={data.master.selection.filters}
          bind:status={data.master.status}
          {profile}
        />
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
              <SelectNodeId
                cpu={worker.cpu}
                memory={worker.memory}
                publicIp={worker.publicIp}
                ssd={worker.diskSize}
                filters={worker.selection.filters}
                bind:data={worker.node}
                bind:nodeSelection={worker.selection.type}
                bind:status={worker.status}
                {profile}
              />
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
{#if modalData}
  <Modal data={modalData} on:closed={() => (modalData = null)} />
{/if}

<!-- </Layout> -->
<style lang="scss" scoped>
  @import url("https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css");
  @import "../../assets/global.scss";
</style>
