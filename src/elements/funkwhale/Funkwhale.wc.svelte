<svelte:options tag="tf-funkwhale" />

<script lang="ts">
  import type { IFormField, ITab } from "../../types";
  import type { IProfile } from "../../types/Profile";

  const deploymentStore = window.configs?.deploymentStore;

  import VM, { Env } from "../../types/vm";
  import deployFunkwhale from "../../utils/deployFunkwhale";

  // Components
  import SelectProfile from "../../components/SelectProfile.svelte";
  import Input from "../../components/Input.svelte";
  import Tabs from "../../components/Tabs.svelte";
  import SelectNodeId from "../../components/SelectNodeId.svelte";
  import DeployBtn from "../../components/DeployBtn.svelte";
  import Alert from "../../components/Alert.svelte";
  import AlertDetailed from "../../components/AlertDetailed.svelte";
  import hasEnoughBalance from "../../utils/hasEnoughBalance";
  import validateName, { validateEmail } from "../../utils/validateName";
  import { noActiveProfile } from "../../utils/message";
  import rootFs from "../../utils/rootFs";

  const data = new VM();
  const tabs: ITab[] = [{ label: "Base", value: "base" }];
  let profile: IProfile;

  let active: string = "base";
  let loading = false;
  let success = false;
  let failed = false;
  let status: "valid" | "invalid";

  const nameField: IFormField = { label: "Name", placeholder: "Virtual Machine Name", symbol: "name", type: "text", validator: validateName, invalid: false }; // prettier-ignore
  const userNameField: IFormField = { label: "Username", placeholder: "Username will be used to access your profile", symbol: "username", type: "text", validator: validateName, invalid: false }; // prettier-ignore
  const emailField: IFormField = { label: "Email", placeholder: "This email will be used to login to your instance", symbol: "email", type: "text", validator: validateEmail, invalid: false }; // prettier-ignore

  const passwordField: IFormField = { label: "Password", placeholder: "Password", symbol: "password", type: "password", invalid: false }; // prettier-ignore

  $: disabled = ((loading || !data.valid) && !(success || failed)) || !profile || nameField.invalid || status !== "valid"; // prettier-ignore
  const currentDeployment = window.configs?.currentDeploymentStore;

  let message: string;

  let domain: string, planetaryIP: string;

  async function onDeployVM() {
    loading = true;
    success = false;
    failed = false;
    message = undefined;

    if (!hasEnoughBalance()) {
      failed = true;
      loading = false;
      message =
        "No enough balance to execute! Transaction requires 2 TFT at least in your wallet.";
      return;
    }

    deployFunkwhale(data, profile)
      .then(({ domain: d, planetaryIP: ip }) => {
        deploymentStore.set(0);
        success = true;
        domain = d;
        planetaryIP = ip;
      })
      .catch((err) => {
        failed = true;
        message = typeof err === "string" ? err : err.message;
      })
      .finally(() => {
        loading = false;
      });
  }

  $: logs = $currentDeployment;
</script>

<SelectProfile
  on:profile={({ detail }) => {
    profile = detail;
    if (detail) {
      data.envs[0] = new Env(undefined, "SSH_KEY", detail.sshKey);
    }
  }}
/>

<div style="padding: 15px;">
  <form on:submit|preventDefault={onDeployVM} class="box">
    <h4 class="is-size-4">Deploy a Funkwhale Instance</h4>
    <hr />

    {#if loading || (logs !== null && logs.type === "Funkwhale")}
      <Alert type="info" message={logs?.message ?? "Loading..."} />
    {:else if !profile}
      <Alert type="info" message={noActiveProfile} />
    {:else if success}
      <AlertDetailed
        type="success"
        message="Successfully deployed a Funkwhale instance"
        {planetaryIP}
        {domain}
        deployed={true}
      />
    {:else if failed}
      <Alert type="danger" message={message || "Failed to deploy Funkwhale"} />
    {:else}
      <Tabs bind:active {tabs} />
      {#if active === "base"}
        <Input
          bind:data={data.name}
          bind:invalid={nameField.invalid}
          field={nameField}
        />
        <Input
          bind:data={data.username}
          bind:invalid={userNameField.invalid}
          field={userNameField}
        />
        <Input
          bind:data={data.email}
          bind:invalid={emailField.invalid}
          field={emailField}
        />
        <Input
          bind:data={data.password}
          bind:invalid={passwordField.invalid}
          field={passwordField}
        />
        <SelectNodeId
          publicIp={false}
          cpu={data.cpu}
          memory={data.memory}
          ssd={data.disks.reduce(
            (total, disk) => total + disk.size,
            rootFs(data.cpu, data.memory)
          )}
          bind:data={data.nodeId}
          bind:nodeSelection={data.selection.type}
          bind:status
          filters={data.selection.filters}
          {profile}
          on:fetch={({ detail }) => (data.selection.nodes = detail)}
          nodes={data.selection.nodes}
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
