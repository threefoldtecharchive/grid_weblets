<svelte:options tag="tf-update-caprover" />

<script lang="ts">
  // libs
  import type { IProfile } from "../types/Profile";
  import { IFormField, IPackage, SelectCapacityUpdate } from "../types";
  import validateName, { isInvalid } from "../utils/validateName"; // prettier-ignore
  const currentDeployment = window.configs?.currentDeploymentStore;

  // components
  import Alert from "./Alert.svelte";
  import Input from "./Input.svelte";
  import SelectNodeId from "./SelectNodeId.svelte";
  import DeployBtn from "./DeployBtn.svelte";
  import { createEventDispatcher, onMount } from "svelte";
  import Table from "./Table.svelte";
  import rootFs from "../utils/rootFs";
  import { CapWorker } from "../types/caprover";
  import SelectCapacity from "./SelectCapacity.svelte";
  import getGrid from "../utils/getGrid";
  import DialogueMsg from "./DialogueMsg.svelte";
  import { InternalSolutionProviderID } from "../utils/solutionProvider";
  const { AddMachineModel, DeleteMachineModel, DiskModel } = window.configs?.grid3_client ?? {}; // prettier-ignore

  const dispatch = createEventDispatcher<{ closed: boolean }>();

  export let profile: IProfile;
  export let capRover: any;

  let workers: any[] = [];

  let shouldBeUpdated = false;
  let loading = false;
  let workers_loading = true;
  let message: string;
  let success = false;
  let failed = false;
  let removing: string = null;
  let domain = "";
  let opened = false;
  let workerIndex = 0;
  let name: string = null;
  let worker = new CapWorker();
  let grid;

  const CAPROVER_FLIST = "https://hub.grid.tf/tf-official-apps/tf-caprover-main.flist";

  // prettier-ignore
  const workerFields: IFormField[] = [ 
    { label: "Name", symbol: "name", placeholder: "Worker instance name", type: "text", validator: validateName, invalid: false },
  ];

  const packages: IPackage[] = [
    { name: "Minimum", cpu: 1, memory: 1024, diskSize: 50 },
    { name: "Standard", cpu: 2, memory: 1024 * 2, diskSize: 100 },
    { name: "Recommended", cpu: 4, memory: 1024 * 4, diskSize: 250 },
  ];
  let selectCapacity = new SelectCapacityUpdate();

  $: workerData = false;
  $: workerIp = "";
  $: disabled = loading || selectCapacity.invalid || isInvalid([...workerFields]) || !worker.valid; // prettier-ignore
  $: logs = $currentDeployment;

  onMount(async () => {
    worker.publicKey = capRover.details.env.PUBLIC_KEY;
    domain = capRover.details.env.CAPROVER_ROOT_DOMAIN;

    grid = await getGrid(profile, grid => grid, "CapRover");

    if (capRover)
      workers = (await grid.machines.getObj(capRover["name"])).filter(
        machine => machine.env["SWM_NODE_MODE"] == "worker",
      );

    workers_loading = false;
  });

  async function onAddWorker() {
    loading = true;
    currentDeployment.deploy("Add Worker", worker.name);

    /* Docker disk */
    const disk = new DiskModel();
    disk.name = "data0";
    disk.size = worker.diskSize;
    disk.mountpoint = "/var/lib/docker";

    const workerModel = new AddMachineModel();
    workerModel.deployment_name = capRover["name"];
    workerModel.cpu = worker.cpu;
    workerModel.memory = worker.memory;
    workerModel.disks = [disk];
    workerModel.node_id = worker.nodeId;
    workerModel.public_ip = true;
    workerModel.name = `CRW${worker.name}`;
    workerModel.planetary = false;
    workerModel.flist = CAPROVER_FLIST;
    workerModel.qsfs_disks = [];
    workerModel.rootfs_size = rootFs(worker.cpu, worker.memory);
    workerModel.entrypoint = "/sbin/zinit init";
    workerModel.env = {
      SWM_NODE_MODE: "worker",
      PUBLIC_KEY: worker.publicKey,
    };
    workerModel.solutionProviderID = InternalSolutionProviderID;
    grid.machines
      .add_machine(workerModel)
      .then(({ contracts }) => {
        const { created, updated } = contracts;
        if (updated.length > 0 || created.length > 0) {
          success = true;
          shouldBeUpdated = true;
          worker = new CapWorker();
          return grid.machines.getObj(workerModel.deployment_name);
        } else {
          failed = true;
        }
      })
      .then(data => {
        if (!data) return;
        workers = data.filter(machine => machine.env["SWM_NODE_MODE"] == "worker");
        workerData = true;
        workerIp = workers[data.length - 1].publicIP["ip"];
      })
      .catch(err => {
        failed = true;
        console.log("Error", err);
        message = err.message || err;
      })
      .finally(() => {
        loading = false;
        currentDeployment.clear();
      });
  }

  function onDeleteWorker(idx: number) {
    const worker = workers[idx];
    removing = worker.name;
    loading = true;
    currentDeployment.deploy("Remove Worker", worker.name);
    const workerModel = new DeleteMachineModel();
    workerModel.deployment_name = capRover.name;
    workerModel.name = removing;
    grid.machines
      .delete_machine(workerModel)
      .then(({ deleted, updated }) => {
        if (deleted.length > 0 || updated.length > 0) {
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
      .catch(err => {
        console.log("Error", err);
        message = err.message || err;
      })
      .finally(() => {
        loading = false;
        removing = null;
        currentDeployment.clear();
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
        publicIP: { ip },
        capacity: { cpu, memory },
        mounts: [{ size }],
      } = worker;
      return [i + 1, contractId, name, ip, cpu, memory, size / (1024 * 1024 * 1024)];
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

  {#if capRover}
    <div class="modal-content" style="width: fit-content" on:click|stopPropagation>
      <div class="box">
        <h4 class="is-size-4">
          Manage CapRover({capRover.name}) Workers
        </h4>

        {#if workers.length}
          <hr />
          <Table
            rowsData={workers}
            headers={["#", "Contract ID", "Name", "Public IP", "CPU(vCores)", "Memory(MB)", "Disk(GB)"]}
            rows={_createWorkerRows(workers)}
            selectable={false}
            actions={[
              {
                label: "Delete",
                type: "danger",
                loading: i => loading && removing === workers[i].name,
                click: (_, i) => {
                  (workerIndex = i), (name = `worker ${workers[i].name}`);
                  opened = !opened;
                },
                disabled: () => loading || removing !== null,
              },
            ]}
          />
          <DialogueMsg bind:opened on:removed={onDeleteWorker(workerIndex)} {name} />
          <hr />
        {:else if workers_loading}
          <Alert type="info" message={logs?.message ?? "Loading..."} />
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
              <Input bind:data={worker[field.symbol]} bind:invalid={field.invalid} {field} />
            {/each}

            <SelectCapacity
              {packages}
              cpu={worker.cpu}
              memory={worker.memory}
              diskSize={worker.diskSize}
              selectedPackage={selectCapacity.selectedPackage}
              on:update={({ detail }) => {
                selectCapacity = detail;
                if (!detail.invalid) {
                  const { cpu, memory, diskSize } = detail.package;
                  worker.cpu = cpu;
                  worker.memory = memory;
                  worker.diskSize = diskSize;
                }
              }}
            />

            <SelectNodeId
              cpu={worker.cpu}
              memory={worker.memory}
              publicIp={true}
              ssd={worker.diskSize + rootFs(worker.cpu, worker.memory)}
              bind:data={worker.nodeId}
              bind:nodeSelection={worker.selection.type}
              bind:status={worker.status}
              filters={worker.selection.filters}
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
            on:click={e => {
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

<div class={"modal" + (workerData ? " is-active" : "")}>
  <div class="modal-background" />
  <div class="modal-card">
    <section class="modal-card-body">
      <strong style="font-size: larger;">Add your worker</strong>
      <br />
      <br />
      1- Go to {"http://captain." + domain}<br />
      2- Go to the <strong>cluster</strong> tab<br />
      3- Click <strong>Add Self-Hosted Registry</strong> button then
      <strong>Enable Self-Hosted Registry</strong><br />
      4- Insert worker node public IP <strong>{workerIp}</strong> and add your private SSH Key<br />
      5- Click <strong>Join cluster</strong> button<br />
      <br />
      <strong>
        <a target="_blank" href="https://manual.grid.tf/weblets/weblets_caprover_worker.html">
          Click here for the documentation
        </a>
      </strong>
      <div style="float: right; margin-top: 50px;">
        <button class="button is-danger" on:click|stopPropagation={() => (workerData = !workerData)}>Close</button>
      </div>
    </section>
  </div>
</div>

<style lang="scss" scoped>
  @import url("https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css");
</style>
