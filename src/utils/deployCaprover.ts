import type Caprover from "../types/caprover";
import { Network } from "../types/kubernetes";
import type { IProfile } from "../types/Profile";
import checkVMExist from "./prepareDeployment";
import createNetwork from "./createNetwork";
import deploy from "./deploy";
import rootFs from "./rootFs";
import { InternalSolutionProviderID } from "./solutionProvider";

const CAPROVER_FLIST = "https://hub.grid.tf/tf-official-apps/tf-caprover-latest.flist";

export default async function deployCaprover(data: Caprover, profile: IProfile) {
  const { MachinesModel, DiskModel, MachineModel } = window.configs.grid3_client;
  const { name, workers, memory, nodeId, publicKey, cpu, domain, diskSize, password } = data; // prettier-ignore

  const network = createNetwork(new Network(`NW${name}`, "10.200.0.0/16")); // prettier-ignore

  /* Docker disk */
  const disk = new DiskModel();
  disk.name = "data0";
  disk.size = diskSize;
  disk.mountpoint = "/var/lib/docker";

  const machine = new MachineModel();
  machine.cpu = cpu;
  machine.memory = memory;
  machine.disks = [disk];
  machine.node_id = nodeId;
  machine.public_ip = true;
  machine.name = name;
  machine.planetary = false;
  machine.flist = CAPROVER_FLIST;
  machine.qsfs_disks = [];
  machine.rootfs_size = rootFs(cpu, memory);
  machine.entrypoint = "/sbin/zinit init";
  machine.env = {
    SWM_NODE_MODE: "leader",
    CAPROVER_ROOT_DOMAIN: domain,
    CAPTAIN_IMAGE_VERSION: "latest",
    PUBLIC_KEY: publicKey,
    DEFAULT_PASSWORD: password,
    CAPTAIN_IS_DEBUG: "true",
  };
  machine.solutionProviderID = InternalSolutionProviderID;

  const machines = new MachinesModel();
  machines.name = name;
  machines.machines = [machine];
  machines.network = network;
  machines.description = "caprover leader machine/node";

  for (const worker of workers) {
    /* Docker disk */
    const disk = new DiskModel();
    disk.name = "data0";
    disk.size = worker.diskSize;
    disk.mountpoint = "/var/lib/docker";

    const workerModel = new MachineModel();

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
      PUBLIC_KEY: publicKey,
    };
    workerModel.solutionProviderID = InternalSolutionProviderID;

    machines.machines.push(workerModel);
  }

  const metadate = {
    type: "vm",
    name: name,
    projectName: "CapRover",
  };
  machines.metadata = JSON.stringify(metadate);

  return deploy(profile, "CapRover", name, async grid => {
    await checkVMExist(grid, "CapRover", name);
    return grid.machines
      .deploy(machines)
      .then(() => grid.machines.getObj(name))
      .then(([vm]) => vm)
      .then(() => grid);
  });
}
