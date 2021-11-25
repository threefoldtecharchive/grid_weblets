<svelte:options tag="tf-peertube" />

<script lang="ts">
  import VM, { Disk, Env } from "../../types/vm";
  import type { IFlist, IFormField, ITab } from "../../types";
  import deployPeertube from "../../utils/deployPeertube";
  import type { IProfile } from "../../types/Profile";
  // Components
  import SelectProfile from "../../components/SelectProfile.svelte";
  import Input from "../../components/Input.svelte";
  import Tabs from "../../components/Tabs.svelte";
  import SelectNodeId from "../../components/SelectNodeId.svelte";
  import DeployBtn from "../../components/DeployBtn.svelte";
  import Alert from "../../components/Alert.svelte";
  const tabs: ITab[] = [{ label: "Base", value: "base" }];
  let data = new VM();
  const nameField: IFormField = { label: "Name", placeholder: "Virtual Machine Name", symbol: "name", type: "text" }; // prettier-ignore
  const { events } = window.configs?.grid3_client ?? {};
  const deploymentStore = window.configs?.deploymentStore;
  let active: string = "base";
  let loading = false;
  let success = false;
  let failed = false;
  let profile: IProfile;
  $: disabled = ((loading || !data.valid) && !(success || failed)) || !profile || profile.mnemonics === "" || profile.storeSecret === ""; // prettier-ignore
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
    deployPeertube(data, profile)
      .then(() => {
        deploymentStore.set(0);
        success = true;
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
    <h4 class="is-size-4">Deploy a Peertube Instance</h4>
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

      {#if active === "base"}
        <Input bind:data={data.name} field={nameField} />

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
