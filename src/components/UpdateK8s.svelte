<svelte:options tag="tf-update-k8s" />

<script lang="ts">
  // libs
  import type { IProfile } from "../types/Profile";
  import { Worker } from "../types/kubernetes";
  import type { IFormField, ITab } from "../types";
  import validateName, { isInvalid, validateCpu, validateDisk, validateKubernetesMemory } from "../utils/validateName"; // prettier-ignore
  const { AddWorkerModel, DeleteWorkerModel } = window.configs?.grid3_client ?? {}; // prettier-ignore
  const currentDeployment = window.configs?.currentDeploymentStore;

  // components
  import Alert from "./Alert.svelte";
  import Input from "./Input.svelte";
  import SelectNodeId from "./SelectNodeId.svelte";
  import getGrid from "../utils/getGrid";
  import DeployBtn from "./DeployBtn.svelte";
  import { createEventDispatcher } from "svelte";
  import Table from "./Table.svelte";
  import RootFsSize from "./RootFsSize.svelte";
  import rootFs from "../utils/rootFs";

  const dispatch = createEventDispatcher<{ closed: boolean }>();

  export let profile: IProfile;
  export let k8s: any;

  let workers: any[] = [];
  $: if (k8s) workers = k8s.details.workers;

  let shouldBeUpdated: boolean = false;
  let loading: boolean = false;
  let message: string;
  let success: boolean = false;
  let failed: boolean = false;
  let removing: string = null;

  let worker = new Worker();
  // prettier-ignore
  const workerFields: IFormField[] = [ 
    { label: "Name", symbol: "name", placeholder: "Cluster instance name", type: "text", validator: validateName, invalid: false },
    { label: "CPU (vCores)", symbol: "cpu", placeholder: "CPU vCores", type: 'number', validator: validateCpu, invalid: false },
    { label: "Memory (MB)", symbol: "memory", placeholder: "Memory in MB", type: 'number', validator: validateKubernetesMemory, invalid: false },
    { label: "Disk Size (GB)", symbol: "diskSize", placeholder: "Disk size in GB", type: 'number', validator: validateDisk, invalid: false },
    { label: "Public IPv4", symbol: "publicIp", type: 'checkbox' },
    { label: "Public IPv6", symbol: "publicIp6", type: 'checkbox' },
    { label: "Planetary Network", symbol: "planetary", placeholder: "Enable planetary network", type: 'checkbox' },
  ];

  $: disabled = loading || isInvalid(workerFields) || !worker || worker.status !== "valid" || worker.rootFs < rootFs(worker.cpu, worker.memory) || !worker.rootFs; // prettier-ignore
  $: logs = $currentDeployment;

  function onAddWorker() {
    loading = true;
    currentDeployment.deploy("Add Worker", worker.name);
    getGrid(profile, (grid) => {
      const { name, cpu, memory, diskSize, publicIp, publicIp6,planetary, node, rootFs } = worker; // prettier-ignore
      const workerModel = new AddWorkerModel();
      workerModel.deployment_name = k8s.name;
      workerModel.name = name;
      workerModel.cpu = cpu;
      workerModel.memory = memory;
      workerModel.disk_size = diskSize;
      workerModel.public_ip = publicIp;
      workerModel.public_ip6 = publicIp6;
      workerModel.planetary = planetary;
      workerModel.rootfs_size = rootFs;
      workerModel.node_id = node;
      grid.k8s
        .add_worker(workerModel)
        .then(({ contracts }) => {
          const { updated } = contracts;
          if (updated.length > 0) {
            success = true;
            shouldBeUpdated = true;
            worker = new Worker();
            return grid.k8s.getObj(k8s.name);
          } else {
            failed = true;
          }
        })
        .then((data) => {
          if (!data) return;
          workers = data.workers;
        })
        .catch((err) => {
          failed = true;
          console.log("Error", err);
          message = err.message || err;
        })
        .finally(() => {
          loading = false;
          currentDeployment.clear();
        });
    });
  }

  function onDeleteWorker(idx: number) {
    const worker = workers[idx];
    removing = worker.name;
    loading = true;
    currentDeployment.deploy("Remove Worker", worker.name);
    getGrid(profile, (grid) => {
      const workerModel = new DeleteWorkerModel();
      workerModel.deployment_name = k8s.name;
      workerModel.name = removing;
      grid.k8s
        .delete_worker(workerModel)
        .then(({ deleted }) => {
          if (deleted.length > 0) {
            shouldBeUpdated = true;
            let r = removing;
            requestAnimationFrame(() => {
              workers = workers.filter(({ name }) => name !== r); // prettier-ignore
            });
          } else {
            failed = true;
            message = "Failed to remove worker";
          }
        })
        .catch((err) => {
          console.log("Error", err);
          message = err.message || err;
        })
        .finally(() => {
          loading = false;
          removing = null;
          currentDeployment.clear();
        });
    });
  }

  const style = `
<style>
  .modal-content {
    width: calc(100% - 30px);
    max-height: 70vh;
    transform: translateY(30px);
    background-color: white;
  }

  .modal-content::-webkit-scrollbar-thumb {
    background-color: #d3d3d3;
  }
  
  .modal-content::-webkit-scrollbar {
    width: 10px;
  }

  .content {
    overflow-x: hidden;
    overflow-y: auto;
    background-color: #fff;
  }

  .modal-content > div,
  .content {
    width: 100%;
  }

</style>
`;
  function _createWorkerRows(workers: any[]) {
    // prettier-ignore
    workers.sort(
      (a, b) => a.created - b.created
    )
    return workers.map((worker, i) => {
      const {
        contractId,
        name,
        planetary,
        capacity: { cpu, memory },
        mounts: [{ size }],
      } = worker;
      return [
        i + 1,
        contractId,
        name,
        planetary,
        cpu,
        memory,
        size / (1024 * 1024 * 1024),
      ];
    });
  }
</script>

<div>
  {@html style}
</div>

<div class="modal is-active">
  <div
    class="modal-background"
    on:click|preventDefault={() => {
      if (!loading) {
        dispatch("closed", shouldBeUpdated);
      }
    }}
  />

  {#if k8s}
    <div
      class="modal-content"
      style="width: fit-content"
      on:click|stopPropagation
    >
      <div class="box">
        <h4 class="is-size-4">
          Manage K8S({k8s.name}) Workers
        </h4>

        {#if workers.length}
          <hr />
          <Table
            rowsData={workers}
            headers={[
              "#",
              "Contract ID",
              "Name",
              "Planetary Network IP",
              "CPU(vCores)",
              "Memory(MB)",
              "Disk(GB)",
            ]}
            rows={_createWorkerRows(workers)}
            selectable={false}
            actions={[
              {
                label: "Delete",
                type: "danger",
                loading: (i) => loading && removing === workers[i].name,
                click: (_, i) => onDeleteWorker(i),
                disabled: () => loading || removing !== null,
              },
            ]}
          />
          <hr />
        {:else}
          <hr style="width: 1200px" />
        {/if}

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

            <RootFsSize
              rootFs={worker.rootFs}
              editable={worker.rootFsEditable}
              cpu={worker.cpu}
              memory={worker.memory}
              on:update={({ detail }) => (worker.rootFs = detail)}
              on:editableUpdate={({ detail }) =>
                (worker.rootFsEditable = detail)}
            />

            <SelectNodeId
              cpu={worker.cpu}
              memory={worker.memory}
              publicIp={worker.publicIp}
              ssd={worker.diskSize + worker.rootFs}
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
            loading={loading && removing === null}
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
      </div>
    </div>
  {/if}
</div>

<style lang="scss" scoped>
  @import url("https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css");
</style>
