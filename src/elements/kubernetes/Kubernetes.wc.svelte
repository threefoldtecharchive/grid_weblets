<svelte:options tag="tf-kubernetes" />

<script lang="ts">
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
  import validateName, {
    isInvalid,
    validateCpu,
    validateDisk,
    validatePrivateIPRange,
    validateKubernetesMemory,
    validateToken,
  } from "../../utils/validateName";
  import { noActiveProfile } from "../../utils/message";
  import RootFsSize from "../../components/RootFsSize.svelte";
  import { display } from "../../utils/display";
  import normalizeDeploymentErrorMessage from "../../utils/normalizeDeploymentErrorMessage";
  import getWireguardConfig from "../../utils/getWireguardConfig";

  // prettier-ignore
  const tabs: ITab[] = [
    { label: "Config", value: "config" },
    { label: "Master", value: "master" },
    { label: "Workers", value: "workers" },
  ];

  // prettier-ignore
  const kubernetesFields: IFormField[] = [
    { label: "Name", symbol: "name", placeholder: "Your K8S Name", type: "text", validator: validateName, invalid: false },
    { label: "Cluster Token", symbol: "secret", placeholder: "Cluster Token", type: "password", validator: validateToken, invalid: false },
  ];

  // // prettier-ignore
  // const networkFields: IFormField[] = [
  //   { label: "Network Name", symbol: "name", placeholder: "Network Name", type: "text", validator: validateName , invalid: false},
  //   { label: "Network IP Range", symbol: "ipRange", placeholder: "xxx.xxx.0.0/16", type: "text", validator: validatePrivateIPRange, invalid: false },
  // ];

  // prettier-ignore
  const baseFields: IFormField[] = [
    { label: "Name", symbol: "name", placeholder: "Cluster instance name", type: "text", validator: validateName, invalid: false},
    { label: "CPU (vCores)", symbol: "cpu", placeholder: "CPU vCores", type: 'number', validator: validateCpu, invalid: false },
    { label: "Memory (MB)", symbol: "memory", placeholder: "Memory in MB", type: 'number', validator: validateKubernetesMemory, invalid: false },
    { label: "Disk Size (GB)", symbol: "diskSize", placeholder: "Disk size in GB", type: 'number', validator: validateDisk, invalid: false },
    { label: "Public IPv4", symbol: "publicIp", type: 'checkbox' },
    { label: "Public IPv6", symbol: "publicIp6", type: 'checkbox' },
    { label: "Planetary Network", symbol: "planetary", placeholder: "Enable planetary network", type: 'checkbox' },
  ];

  let data = new Kubernetes();
  const currentDeployment = window.configs?.currentDeploymentStore;

  let active = "config";
  let loading = false;
  let success = false;
  let failed = false;
  let profile: IProfile;
  let message: string;
  $: disabled =
    ((loading || !data.valid) && !(success || failed)) ||
    !profile ||
    data.master.status !== "valid" ||
    data.workers.reduce((res, { status }) => res || status !== "valid", false) ||
    isInvalid([...baseFields, ...kubernetesFields]);

  // prettier-ignore
  let modalData: object;

  async function onDeployKubernetes() {
    loading = true;

    if (!hasEnoughBalance()) {
      failed = true;
      loading = false;
      message = "No enough balance to execute! Transaction requires 2 TFT at least in your wallet.";
      return;
    }

    success = false;
    failed = false;
    message = undefined;

    deployKubernetes(data, profile)
      .then(async (data: any) => {
        deploymentStore.set(0);
        success = true;
        const wireguard = await getWireguardConfig({ name: data.interfaces[0].network });
        if (wireguard) {
          data.wireguard = wireguard[0];
        }
        modalData = data;
      })
      .catch((err: any) => {
        failed = true;
        const error = typeof err === "string" ? err : err.message;
        message = normalizeDeploymentErrorMessage(error, "K8s");
      })
      .finally(() => {
        loading = false;
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

  $: logs = $currentDeployment;

  $: showLogs = loading || (logs !== null && logs.type === "Kubernetes");
  $: showNoProfile = !showLogs && !profile;
  $: showSuccess = !showLogs && !showNoProfile && success;
  $: showFailed = !showLogs && !showNoProfile && failed;
  $: showContent = !showLogs && !showNoProfile && !showSuccess && !showFailed;
</script>

<SelectProfile
  on:profile={({ detail }) => {
    profile = detail;
  }}
/>

<div style="padding: 15px;">
  <form on:submit|preventDefault={onDeployKubernetes} class="box">
    <h4 class="is-size-4">Deploy a Kubernetes</h4>
    <p>
      Kubernetes is the standard container orchestration tool. On the TF grid, Kubernetes clusters can be deployed out
      of the box. We have implemented K3S, a full-blown Kubernetes offering that uses only half of the memory footprint.
      It is packaged as a single binary and made more lightweight to run workloads in resource-constrained locations
      (fits e.g. IoT, edge, ARM workloads).

      <a target="_blank" href="https://manual.grid.tf/weblets/weblets_k8s.html"> Quick start documentation</a>
    </p>

    <hr />

    <div style:display={showLogs ? "block" : "none"}>
      <Alert type="info" message={logs?.message ?? "Loading..."} />
    </div>

    <div style:display={showNoProfile ? "block" : "none"}>
      <Alert type="info" message={noActiveProfile} />
    </div>

    <div style:display={showSuccess ? "block" : "none"}>
      <Alert type="success" message="Successfully Deployed Kubernetes." deployed={true} />
    </div>

    <div style:display={showFailed ? "block" : "none"}>
      <Alert type="danger" {message} />
    </div>

    <div style:display={showContent ? "block" : "none"}>
      <Tabs bind:active {tabs} />

      <section style={display(active, "config")}>
        {#each kubernetesFields as field (field.symbol)}
          {#if field.invalid !== undefined}
            <Input bind:data={data[field.symbol]} bind:invalid={field.invalid} {field} />
          {:else}
            <Input bind:data={data[field.symbol]} {field} />
          {/if}
        {/each}
        <!-- {#each networkFields as field (field.symbol)}
          <Input bind:data={data.network[field.symbol]} {field} />
        {/each} -->
      </section>
      <section style={display(active, "master")}>
        {#each baseFields as field (field.symbol)}
          {#if field.invalid !== undefined}
            <Input bind:data={data.master[field.symbol]} bind:invalid={field.invalid} {field} />
          {:else}
            <Input bind:data={data.master[field.symbol]} {field} />
          {/if}
        {/each}

        <RootFsSize
          rootFs={data.master.rootFs}
          editable={data.master.rootFsEditable}
          cpu={data.master.cpu}
          memory={data.master.memory}
          on:update={({ detail }) => (data.master.rootFs = detail)}
          on:editableUpdate={({ detail }) => (data.master.rootFsEditable = detail)}
        />

        <SelectNodeId
          cpu={data.master.cpu}
          memory={data.master.memory}
          publicIp={data.master.publicIp}
          ssd={data.master.diskSize + data.master.rootFs}
          bind:data={data.master.node}
          bind:status={data.master.status}
          {profile}
        />
      </section>
      <section style={display(active, "workers")}>
        <AddBtn on:click={() => (data.workers = [...data.workers, new Worker()])} />
        <div class="nodes-container">
          {#each data.workers as worker, index (worker.id)}
            <div class="box">
              <DeleteBtn
                name={worker.name}
                on:click={() => (data.workers = data.workers.filter((_, i) => index !== i))}
              />
              {#each baseFields as field (field.symbol)}
                {#if field.invalid !== undefined}
                  <Input bind:data={worker[field.symbol]} bind:invalid={field.invalid} {field} />
                {:else}
                  <Input bind:data={worker[field.symbol]} {field} />
                {/if}
              {/each}

              <RootFsSize
                rootFs={worker.rootFs}
                editable={worker.rootFsEditable}
                cpu={worker.cpu}
                memory={worker.memory}
                on:update={({ detail }) => (worker.rootFs = detail)}
                on:editableUpdate={({ detail }) => (worker.rootFsEditable = detail)}
              />

              <SelectNodeId
                cpu={worker.cpu}
                memory={worker.memory}
                publicIp={worker.publicIp}
                ssd={worker.diskSize + worker.rootFs}
                bind:data={worker.node}
                bind:status={worker.status}
                {profile}
              />
            </div>
          {/each}
        </div>
      </section>
    </div>

    <DeployBtn {disabled} {loading} {failed} {success} on:click={onResetHandler} />
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
