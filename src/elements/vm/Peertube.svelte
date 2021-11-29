<svelte:options tag="tf-vm" />

<script lang="ts">
  import VM, { Disk, Env } from "../../types/vm";
  import type { IFlist, IFormField, ITab } from "../../types";
  import deployVM from "../../utils/deployVM";
  import type { IProfile } from "../../types/Profile";
  import validateNode from "../../utils/validateNode";

  // Components
  import SelectProfile from "../../components/SelectProfile.svelte";
  import Input from "../../components/Input.svelte";
  import Tabs from "../../components/Tabs.svelte";
  import SelectNodeId from "../../components/SelectNodeId.svelte";
  import DeleteBtn from "../../components/DeleteBtn.svelte";
  import AddBtn from "../../components/AddBtn.svelte";
  import DeployBtn from "../../components/DeployBtn.svelte";
  import Alert from "../../components/Alert.svelte";
  import Modal from "../../components/DeploymentModal.svelte";

  const tabs: ITab[] = [{ label: "Base", value: "base" }];

  let data = new VM();

  // prettier-ignore
  let baseFields: IFormField[] = [
    { label: "CPU", symbol: 'cpu', placeholder: 'CPU Cores', type: 'number' },
    { label: "Memory (MB)", symbol: 'memory', placeholder: 'Your Memory in MB', type: 'number' },
    { label: "Public IP", symbol: "publicIp", placeholder: "", type: 'checkbox' },
    { label: "Planetary Network", symbol: "planetary", placeholder: "", type: 'checkbox' },
  ];

  const nameField: IFormField = { label: "Name", placeholder: "Virtual Machine Name", symbol: "name", type: "text" }; // prettier-ignore

  const { events } = window.configs?.grid3_client ?? {};
  const deploymentStore = window.configs?.deploymentStore;
  let active: string = "base";
  let loading = false;
  let success = false;
  let failed = false;
  let profile: IProfile;
  $: disabled = ((loading || !data.valid) && !(success || failed)) || !profile; // prettier-ignore

  let message: string;
  let modalData: Object;

  let nodeIdError: string;
  async function onDeployVM() {
    const { cpu, memory, publicIp, disks, rootFsSize, nodeId } = data;
    const size = disks.reduce((total, disk) => total + disk.size, rootFsSize);

    function onLogInfo(msg: string) {
      if (typeof msg === "string") {
        message = msg;
      }
    }

    const error =  await validateNode(profile, cpu, memory, size, publicIp, nodeId); // prettier-ignore
    console.log({ error });
    if (error) {
      nodeIdError = error;
      return;
    }

    loading = true;
    nodeIdError = null;
    success = false;
    failed = false;
    message = undefined;

    events.addListener("logs", onLogInfo);
    deployVM(data, profile)
      .then((data) => {
        deploymentStore.set(0);
        success = true;
        modalData = data;
      })
      .catch((err: Error) => {
        failed = true;
        message = typeof err === "string" ? err : err.message;
      })
      .finally(() => {
        loading = false;
        events.removeListener("logs", onLogInfo);
      });
  }
</script>

<div style="padding: 15px;">
  <form on:submit|preventDefault={onDeployVM} class="box">
    <h4 class="is-size-4">Deploy a Virtual Machine</h4>
    <hr />

    {#if loading}
      <Alert type="info" message={message || "Loading..."} />
    {:else if success}
      <Alert type="success" message="Successfully deployed VM." />
    {:else if failed}
      <Alert type="danger" message={message || "Failed to deploy VM."} />
    {:else}
      <SelectProfile
        on:profile={({ detail }) => {
          profile = detail;
          if (detail) {
            data.envs[0] = new Env(undefined, "SSH_KEY", detail?.sshKey);
          }
        }}
      />
      <Tabs bind:active {tabs} />

      {#if active === "base"}
        <Input bind:data={data.name} field={nameField} />

        <SelectNodeId
          error={nodeIdError}
          publicIp={data.publicIp}
          cpu={data.cpu}
          memory={data.memory}
          ssd={data.disks.reduce(
            (total, disk) => total + disk.size,
            data.rootFsSize
          )}
          bind:data={data.nodeId}
          {profile}
        />
      {/if}
    {/if}

    <DeployBtn
      {disabled}
      {loading}
      {failed}
      {success}
      on:click={(e) => {
        if (success || failed) {
          e.preventDefault();
          success = false;
          failed = false;
          loading = false;
        }
      }}
    />
  </form>
</div>
{#if modalData}
  <Modal data={modalData} on:closed={() => (modalData = null)} />
{/if}

<style lang="scss" scoped>
  @import url("https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css");
  @import "../../assets/global.scss";
</style>
