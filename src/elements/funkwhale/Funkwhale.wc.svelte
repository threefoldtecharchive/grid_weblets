<svelte:options tag="tf-funkwhale" />

<script lang="ts">
  import type { IFormField, ITab } from "../../types";
  import type { IProfile } from "../../types/Profile";

  const { events } = window.configs?.grid3_client ?? {};
  const deploymentStore = window.configs?.deploymentStore;

  import VM, { Disk, Env } from "../../types/vm";
  import deployFunkwhale, {
    gateway,
    funkYggIp,
  } from "../../utils/deployFunkwhale";

  // Components
  import SelectProfile from "../../components/SelectProfile.svelte";
  import Input from "../../components/Input.svelte";
  import Tabs from "../../components/Tabs.svelte";
  import SelectNodeId from "../../components/SelectNodeId.svelte";
  import DeployBtn from "../../components/DeployBtn.svelte";
  import Alert from "../../components/Alert.svelte";
  import AlertDetailed from "../../components/AlertDetailed.svelte";

  const data = new VM();
  const tabs: ITab[] = [{ label: "Base", value: "base" }];
  let profile: IProfile;

  let active: string = "base";
  let loading = false;
  let success = false;
  let failed = false;

  $: disabled = ((loading || !data.valid) && !(success || failed)) || !profile || !data.name.match(/^[a-z][a-z0-9]*$/i) ; // prettier-ignore

  const nameField: IFormField = { label: "Name", placeholder: "Virtual Machine Name", symbol: "name", type: "text"}; // prettier-ignore

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
    deployFunkwhale(data, profile)
      .then(() => {
        deploymentStore.set(0);
        success = true;
        console.log(gateway);
        console.log(funkYggIp);
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

  function validateNameHandler(e: Event) {
    const inp = e.target as HTMLInputElement;
    nameField.error = inp.value.match(/^[a-z][a-z0-9]*$/i)
      ? null
      : "Only alphanumeric names are allowed";
  }
</script>

<div style="padding: 15px;">
  <form on:submit|preventDefault={onDeployVM} class="box">
    <h4 class="is-size-4">Deploy a Funkwhale Instance</h4>
    <hr />

    {#if loading}
      <Alert type="info" message={message || "Loading..."} />
    {:else if success}
      <AlertDetailed
        type="success"
        message="Successfully Deployed A Funkwhale Instance"
        planetaryIP={funkYggIp}
        {gateway}
      />
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
        <Input
          bind:data={data.name}
          field={nameField}
          on:input={validateNameHandler}
        />

        <SelectNodeId
          publicIp={false}
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
</style>
