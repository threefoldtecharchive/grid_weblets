<svelte:options tag="tf-funkwhale" />

<script lang="ts">
  import VM, { Disk, Env } from "../../types/vm";
  import type { IFormField, ITab } from "../../types";
  const { events } = window.configs?.grid3_client ?? {};
  import deployVM from "../../utils/deployVM";
  import type { IProfile } from "../../types/Profile";

    // Components
    import SelectProfile from "../../components/SelectProfile.svelte";
  import Input from "../../components/Input.svelte";
  import Tabs from "../../components/Tabs.svelte";
  import SelectNodeId from "../../components/SelectNodeId.svelte";
//   import DeleteBtn from "../../components/DeleteBtn.svelte";
//   import AddBtn from "../../components/AddBtn.svelte";
  import DeployBtn from "../../components/DeployBtn.svelte";
  import Alert from "../../components/Alert.svelte";
  
  const data = new VM(undefined, undefined, "https://hub.grid.tf/omar0.3bot/omarelawady-funk-latest.flist");
  
  const tabs: ITab[] = [
    { label: "Config", value: "config" },
  ];
  const deploymentStore = window.configs?.deploymentStore;
  let profile: IProfile;
  let active: string = "Config";
  let loading = false;
  let success = false;
  let failed = false;
  $: disabled = ((loading || !data.valid) && !(success || failed)) || !profile || profile.mnemonics === "" || profile.storeSecret === ""; // prettier-ignore

  const nameField: IFormField = { label: "Name", placeholder: "Virtual Machine Name", symbol: "name", type: "text" }; // prettier-ignore

  // prettier-ignore
  const baseFields: IFormField[] = [
    { label: "CPU", symbol: 'cpu', placeholder: 'Your Cpu size.', type: 'number'},
    { label: "Memory", symbol: 'memory', placeholder: 'Your Memory size.', type: 'number'},
    { label: "Public IP", symbol: "publicIp", placeholder: "", type: 'checkbox' },
    { label: "Planetary", symbol: "planetary", placeholder: "", type: 'checkbox' },  
  ];

  let message: string;
  function onDeployVM() {

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

    deployVM(data, profile)
      .then(() => {
        deploymentStore.set(0);  
        success = true;
      })
      .catch((err) => {
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
    <h4 class="is-size-4">Deploy a Funkwhale Instance</h4>
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
          data.envs[0] = new Env(undefined, "SSH_KEY", detail.sshKey);
        }}
      />
      <Tabs bind:active {tabs} />
      {#if active === "config"}
        <Input bind:data={data.name} field={nameField} />

        {#each baseFields as field (field.symbol)}
          <Input bind:data={data[field.symbol]} {field} />
        {/each}
        <SelectNodeId
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

<style lang="scss" scoped>
    @import url("https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css");
    @import "../../assets/global.scss";
</style>
  