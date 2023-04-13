<svelte:options tag="tf-fullvm" />

<script lang="ts">
  import { Env } from "../../types/vm";
  import Fullvm, { DiskFullVm } from "../../types/fullvm";
  import type { IFlist, IFormField, ITab } from "../../types";
  import deployVM from "../../utils/deployVM";
  import type { IProfile } from "../../types/Profile";

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
  import hasEnoughBalance from "../../utils/hasEnoughBalance";
  import validateName, {
    isInvalid,
    validateCpu,
    validateEntryPoint,
    validateFlistvalue,
    validateMemory,
    validateDisk,
    validatePrivateIPRange,
  } from "../../utils/validateName";
  import { noActiveProfile } from "../../utils/message";
  import isInvalidFlist from "../../utils/isInvalidFlist";
  import { display } from "../../utils/display";
  import normalizeDeploymentErrorMessage from "../../utils/normalizeDeploymentErrorMessage";
  import getWireguardConfig from "../../utils/getWireguardConfig";

  const tabs: ITab[] = [
    { label: "Config", value: "config" },
    { label: "Disks", value: "disks" },
    // { label: "Advanced", value: "advanced" },
  ];

  let data = new Fullvm();

  // prettier-ignore
  let baseFields: IFormField[] = [
    { label: "CPU (vCores)", symbol: 'cpu', placeholder: 'CPU vCores', type: 'number', validator: validateCpu, invalid: false},
    { label: "Memory (MB)", symbol: 'memory', placeholder: 'Your Memory in MB', type: 'number', validator: validateMemory, invalid: false },
    { label: "Disk Size (GB)", symbol: "diskSize", placeholder: "Disk size in GB", type: 'number', validator: validateDisk && _isInvalidDefaultDisk, invalid: false },
    { label: "Public IPv4", symbol: "publicIp", placeholder: "", type: 'checkbox' },
    { label: "Public IPv6", symbol: "publicIp6", placeholder: "", type: 'checkbox' },
    { label: "Planetary Network", symbol: "planetary", placeholder: "", type: 'checkbox' },
    { label: "Add Wireguard Access", symbol: "wireguard", placeholder: "", type: 'checkbox' },
  ];

  const nameField: IFormField = { label: "Name", placeholder: "Virtual Machine Name", symbol: "name", type: "text", validator: validateName, invalid: false }; // prettier-ignore

  // prettier-ignore
  const networkFields: IFormField[] = [
    { label: "Network Name", symbol: "name", placeholder: "Network Name", type: "text", validator: validateName , invalid: false},
    { label: "Network IP Range", symbol: "ipRange", placeholder: "xxx.xxx.0.0/16", type: "text", validator: validatePrivateIPRange, invalid: false },
  ];

  // prettier-ignore
  const flists: IFlist[] = [
    { name: "Ubuntu-18.04", url: "https://hub.grid.tf/tf-official-vms/ubuntu-18.04-lts.flist", entryPoint: "/init.sh" },
    { name: "Ubuntu-20.04", url: "https://hub.grid.tf/tf-official-vms/ubuntu-20.04-lts.flist", entryPoint: "/init.sh" },
    { name: "Ubuntu-22.04", url: "https://hub.grid.tf/tf-official-vms/ubuntu-22.04.flist", entryPoint: "/init.sh" },
    { name: "Nixos-22.11", url: "https://hub.grid.tf/tf-official-vms/nixos-22.11.flist", entryPoint: "/init.sh" },

  ];

  // prettier-ignore
  const flistField: IFormField = {
    label: "VM Image",
    symbol: "flist",
    type: "select",
    options: [
      { label: "Ubuntu-18.04", value: "0" },
      { label: "Ubuntu-20.04", value: "1" },
      { label: "Ubuntu-22.04", value: "2", selected: true },
      { label: "Nixos-22.11", value: "3" },
      { label: "Other", value: "other" }
    ]
  };
  let selectedFlist = 2;
  let flistSelectValue = "2";
  $: {
    const option = flistField.options[selectedFlist];
    if (option.value !== "other") {
      const flist = flists[selectedFlist];
      data.flist = flist?.url;
      data.entrypoint = flist?.entryPoint;
    }
  }

  const deploymentStore = window.configs?.deploymentStore;
  let active = "config";
  let loading = false;
  let success = false;
  let failed = false;
  let profile: IProfile;
  let message: string;
  let modalData: Record<string, unknown>;
  let status: "valid" | "invalid";

  data.disks = [new DiskFullVm(undefined, undefined, data.diskSize, "/"), ...data.disks];

  function _isInvalidDisks() {
    const names = data.disks.map(({ name }) => name.trim());
    const nameSet = new Set(names);
    return names.length !== nameSet.size;
  }

  function _isInvalidDefaultDisk(value: number): string | void {
    const NUM_REGEX = /^[1-9](\d?|\d+)$/;
    if (!NUM_REGEX.test(value.toString()) || isNaN(+value)) return "Disk size must be a valid number.";
    value = +value;
    if (+value.toFixed(0) !== value) return "Disk size must be a valid integer.";
    if (value < 15) return "Minimum allowed disk size is 15 GB.";
    if (value > 10000) return "Maximum allowed disk size is 10000 GB.";
  }

  $: disabled = ((loading || !data.valid) && !(success || failed)) || !profile || status !== "valid" || validateFlist.invalid || nameField.invalid || isInvalid([...baseFields, ...networkFields]) || _isInvalidDisks(); // prettier-ignore

  const currentDeployment = window.configs?.currentDeploymentStore;
  const validateFlist = {
    loading: false,
    error: null,
    validator: validateFlistvalue,
    invalid: false,
  };

  $: data.disks[0].size = data.diskSize;
  async function onDeployVM() {
    if (flistSelectValue === "other") {
      validateFlist.loading = true;
      validateFlist.error = null;

      if (await isInvalidFlist(data.flist)) {
        validateFlist.loading = false;
        validateFlist.error = "Invalid Flist URL.";
        return;
      }
    }

    loading = true;

    if (!hasEnoughBalance()) {
      failed = true;
      loading = false;
      message = "No enough balance to execute transaction requires 2 TFT at least in your wallet.";
      return;
    }

    success = false;
    failed = false;
    message = undefined;

    data.disks[0].size = data.diskSize;
    deployVM(data, profile, "Fullvm")
      .then(async data => {
        deploymentStore.set(0);
        success = true;
        const wireguard = await getWireguardConfig({ name: data.interfaces[0].network });
        if (wireguard) {
          data.wireguard = wireguard[0];
        }
        modalData = data;
      })
      .catch((err: string) => {
        failed = true;
        message = normalizeDeploymentErrorMessage(err, "FullVM");
      })
      .finally(() => {
        validateFlist.loading = false;
        loading = false;
      });
  }

  function validateDiskName({ id, name }: DiskFullVm) {
    if (!name) return "Disk name is required";
    const valid = data.disks.reduce((v, disk) => {
      if (disk.id === id) return v;
      return v && disk.name.trim() !== name.trim();
    }, true);
    return valid ? null : "Disks can't have duplicated name.";
  }

  $: logs = $currentDeployment;

  $: showLogs = loading || (logs !== null && logs.type === "Fullvm");
  $: showNoProfile = !showLogs && !profile;
  $: showSuccess = !showLogs && !showNoProfile && success;
  $: showFailed = !showLogs && !showNoProfile && failed;
  $: showContent = !showLogs && !showNoProfile && !showSuccess && !showFailed;
</script>

<SelectProfile
  on:profile={({ detail }) => {
    profile = detail;
    if (detail) {
      data.envs[0] = new Env(undefined, "SSH_KEY", detail?.sshKey);
    }
  }}
/>

<div style="padding: 15px;">
  <form on:submit|preventDefault={onDeployVM} class="box">
    <h4 class="is-size-4">Deploy a Full Virtual Machine</h4>
    <p>
      Deploy a new full virtual machine on the Threefold Grid
      <a target="_blank" href="https://manual.grid.tf/weblets/weblets_fullVm.html"> Quick start documentation</a>
    </p>
    <hr />

    <div style:display={showLogs ? "block" : "none"}>
      <Alert type="info" message={logs?.message ?? "Loading..."} />
    </div>

    <div style:display={showNoProfile ? "block" : "none"}>
      <Alert type="info" message={noActiveProfile} />
    </div>

    <div style:display={showSuccess ? "block" : "none"}>
      <Alert type="success" message="Successfully Deployed Fullvm." deployed={true} />
    </div>

    <div style:display={showFailed ? "block" : "none"}>
      <Alert type="danger" {message} />
    </div>

    <div style:display={showContent ? "block" : "none"}>
      <Tabs bind:active {tabs} />

      <section style={display(active, "config")}>
        <Input bind:data={data.name} bind:invalid={nameField.invalid} field={nameField} />

        <Input
          bind:data={flistSelectValue}
          bind:selected={selectedFlist}
          field={flistField}
          on:input={() => {
            validateFlist.error = null;
          }}
        />

        {#if flistSelectValue === "other"}
          <Input
            bind:data={data.flist}
            field={{
              label: "FList",
              symbol: "flist",
              placeholder: "VM Image",
              type: "text",
              ...validateFlist,
            }}
            on:input={() => {
              validateFlist.error = null;
            }}
          />

          <Input
            bind:data={data.entrypoint}
            field={{
              label: "Entry Point",
              symbol: "entrypoint",
              validator: validateEntryPoint,
              placeholder: "Entrypoint",
              type: "text",
            }}
          />
        {/if}

        {#each baseFields as field (field.symbol)}
          {#if field.invalid !== undefined}
            <Input bind:data={data[field.symbol]} bind:invalid={field.invalid} {field} />
          {:else if field.symbol === "wireguard"}
            <Input bind:data={data.network.addAccess} {field} />
          {:else}
            <Input bind:data={data[field.symbol]} {field} />
          {/if}
        {/each}

        <SelectNodeId
          publicIp={data.publicIp}
          cpu={data.cpu}
          memory={data.memory}
          ssd={data.disks.reduce((total, disk) => total + disk.size, data.rootFs)}
          bind:nodeSelection={data.selection.type}
          bind:data={data.nodeId}
          filters={data.selection.filters}
          bind:status
          {profile}
          on:fetch={({ detail }) => (data.selection.nodes = detail)}
          nodes={data.selection.nodes}
        />
      </section>

      <section style={display(active, "disks")}>
        <AddBtn on:click={() => (data.disks = [...data.disks, new DiskFullVm()])} />
        <div class="nodes-container">
          {#each data.disks as disk, index (disk.id)}
            {#if index > 0}
              <div class="box">
                <DeleteBtn name={disk.name} on:click={() => (data.disks = data.disks.filter((_, i) => index !== i))} />
                {#each disk.diskFields as field (field.symbol)}
                  {#if field.symbol === "name"}
                    <Input
                      bind:data={disk[field.symbol]}
                      field={{
                        ...field,
                        error: validateDiskName(disk),
                      }}
                    />
                  {:else}
                    <Input bind:data={disk[field.symbol]} {field} bind:invalid={field.invalid} />
                  {/if}
                {/each}
              </div>
            {/if}
          {/each}
        </div>
      </section>

      <section style={display(active, "advanced")}>
        {#each networkFields as field (field.symbol)}
          <Input bind:data={data.network[field.symbol]} {field} />
        {/each}
      </section>
    </div>

    <DeployBtn
      disabled={disabled || validateFlist.loading}
      loading={loading || validateFlist.loading}
      {failed}
      {success}
      on:click={e => {
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
