<svelte:options tag="tf-update-k8s" />

<script lang="ts">
  // libs
  import type { IProfile } from "../../types/Profile";
  import { noActiveProfile } from "../../utils/message";
  import { Worker } from "../../types/kubernetes";
  import type { IFormField, ITab } from "../../types";
  import { isInvalid, validateCpu, validateDisk, validateMemory } from "../../utils/validateName"; // prettier-ignore
  const { AddWorkerModel, DeleteWorkerModel } = window.configs?.grid3_client ?? {}; // prettier-ignore
  const currentDeployment = window.configs?.currentDeploymentStore;

  // components
  import SelectProfile from "../../components/SelectProfile.svelte";
  import Alert from "../../components/Alert.svelte";
  import Input from "../../components/Input.svelte";
  import DeployedList from "../../types/deployedList";
  import Tabs from "../../components/Tabs.svelte";
  import SelectNodeId from "../../components/SelectNodeId.svelte";
  import getGrid from "../../utils/getGrid";
  import DeployBtn from "../../components/DeployBtn.svelte";

  let profile: IProfile;
  let loading: boolean = false;
  let message: string;
  let selecting: boolean = true;
  let success: boolean = false;
  let failed: boolean = false;

  let selectedIdx: string = null;
  let k8s: any;
  let workerName: string = null;

  let worker = new Worker();
  // prettier-ignore
  const workerFields: IFormField[] = [ 
    { label: "Name", symbol: "name", placeholder: "Cluster instance name", type: "text" },
    { label: "CPU", symbol: "cpu", placeholder: "CPU cores", type: 'number', validator: validateCpu, invalid: false },
    { label: "Memory (MB)", symbol: "memory", placeholder: "Memory in MB", type: 'number', validator: validateMemory, invalid: false },
    { label: "Disk Size (GB)", symbol: "diskSize", placeholder: "Disk size in GB", type: 'number', validator: validateDisk, invalid: false },
    { label: "Public IP", symbol: "publicIp", type: 'checkbox' },
    { label: "Planetary Network", symbol: "planetary", placeholder: "Enable planetary network", type: 'checkbox' },
    { label: "Root FS Size (GB)", symbol: "rootFsSize", placeholder: "Root File System Size in GB", type: 'number' },
  ];

  // prettier-ignore
  let active = "add";
  const tabs: ITab[] = [
    { label: "Add", value: "add" },
    { label: "Remove", value: "remove" },
  ];

  $: disabled = loading || isInvalid(workerFields) || !worker || worker.status !== "valid"; // prettier-ignore
  $: logs = $currentDeployment;

  function onAddWorker() {
    currentDeployment.deploy("Add Worker", worker.name);
    getGrid(profile, (grid) => {
      const { name, cpu, memory, diskSize, publicIp, planetary, rootFsSize, node } = worker; // prettier-ignore
      const workerModel = new AddWorkerModel();
      workerModel.deployment_name = k8s.name;
      workerModel.name = name;
      workerModel.cpu = cpu;
      workerModel.memory = memory;
      workerModel.disk_size = diskSize;
      workerModel.public_ip = publicIp;
      workerModel.planetary = planetary;
      workerModel.rootfs_size = rootFsSize;
      workerModel.node_id = node;

      loading = true;
      grid.k8s
        .add_worker(workerModel)
        .then(({ contracts }) => {
          const { updated } = contracts;
          if (updated.length > 0) {
            success = true;
            worker = new Worker();
          } else {
            failed = true;
          }
        })
        .catch((err) => {
          failed = true;
          console.log("Error", err);
          message = err.message || err;
        })
        .finally(() => {
          loading = false;
          message = null;
          currentDeployment.clear();
        });
    });
  }

  function onDeleteWorker() {
    loading = true;
    getGrid(profile, (grid) => {
      const workerModel = new DeleteWorkerModel();
      workerModel.deployment_name = k8s.name;
      workerModel.name = workerName;
      grid.k8s
        .delete_worker(workerModel)
        .then(({ deleted }) => {
          if (deleted.length > 0) {
            success = true;
            requestAnimationFrame(() => {
              k8s.details.workers = k8s.details.workers.filter(({ name }) => name !== workerName); // prettier-ignore
              workerName = null;
            });
          } else {
            failed = true;
          }
        })
        .catch((err) => {
          console.log("Error", err);
          message = err.message || err;
        })
        .finally(() => {
          loading = false;
          message = null;
          // currentDeployment.clear();
        });
    });
  }
</script>

<SelectProfile on:profile={({ detail }) => (profile = detail)} />

<div style="padding: 15px;">
  <div class="box">
    <h4 class="is-size-4">Update a Kubernetes {k8s ? `(${k8s.name})` : ""}</h4>
    <hr />

    {#if !profile}
      <Alert type="info" message={noActiveProfile} />
    {:else if message}
      <Alert type="danger" {message} />
    {:else if selecting}
      {#await DeployedList.init(profile)}
        <Alert type="info" message="Loading..." />
      {:then list}
        {#await list.loadK8s()}
          <Alert type="info" message="Loading..." />
        {:then k8sList}
          {#if k8sList.length === 0}
            <Alert type="info" message="No k8s were found." />
          {:else}
            <Input
              bind:data={selectedIdx}
              field={{
                label: "Select K8S",
                type: "select",
                symbol: "k8s",
                options: [
                  {
                    label: "Select K8S",
                    value: null,
                    disabled: true,
                    selected: true,
                  },
                  ...k8sList.map((k8s, i) => {
                    return { label: k8s.name, value: i.toString() };
                  }),
                ],
              }}
            />
            <div class="is-flex is-justify-content-center mt-2">
              <button
                class="button is-info"
                disabled={selectedIdx === null}
                on:click={() => {
                  selecting = false;
                  k8s = k8sList[selectedIdx];
                }}
              >
                Select K8S
              </button>
            </div>
          {/if}
        {/await}
      {/await}
    {:else}
      <Tabs
        bind:active
        {tabs}
        disabled={loading}
        on:select={() => {
          success = false;
          failed = false;
          loading = false;
          message = null;
        }}
      />

      {#if active === "add"}
        <form on:submit|preventDefault={onAddWorker}>
          {#if loading || (logs !== null && logs.type === "Add Worker")}
            <Alert type="info" message={logs?.message ?? "Loading..."} />
          {:else if success}
            <Alert type="success" message="Successfully Added Worker." />
          {:else if failed}
            <Alert type="danger" message={message || "Failed to Add Worker."} />
          {:else}
            {#each workerFields as field (field.symbol)}
              {#if field.invalid !== undefined}
                <Input
                  bind:data={worker[field.symbol]}
                  bind:invalid={field.invalid}
                  {field}
                />
              {:else}
                <Input bind:data={worker[field.symbol]} {field} />
              {/if}
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
              on:fetch={({ detail }) => (worker.selection.nodes = detail)}
              nodes={worker.selection.nodes}
            />
          {/if}
          <DeployBtn
            label="Add Worker"
            {loading}
            {success}
            {failed}
            disabled={disabled && !failed && !success}
            on:click={(e) => {
              if (success || failed) {
                e.preventDefault();
                success = false;
                failed = false;
                loading = false;
                message = null;
              }
            }}
          />
        </form>
      {:else if active === "remove"}
        {#if success}
          <Alert type="success" message="Successfully Removed Worker." />
        {:else if failed}
          <Alert
            type="danger"
            message={message || "Failed to Remove Worker."}
          />
        {/if}

        <Input
          bind:data={workerName}
          field={{
            label: "Select a worker",
            symbol: "worker",
            type: "select",
            options: [
              {
                label: "Please! Select a worker",
                value: null,
                disabled: true,
                selected: true,
              },
              ...k8s.details.workers.map(({ name }) => {
                return { label: name, value: name };
              }),
            ],
            disabled: loading,
          }}
          on:input={() => {
            success = false;
            failed = false;
            loading = false;
            message = null;
          }}
        />
        <div class="is-flex is-justify-content-center">
          <button
            class={"button is-danger " + (loading ? "is-loading" : "")}
            disabled={workerName === null || loading}
            on:click={onDeleteWorker}
          >
            Delete Worker
          </button>
        </div>
      {/if}
    {/if}
  </div>
</div>

<style lang="scss" scoped>
  @import url("https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css");
</style>
