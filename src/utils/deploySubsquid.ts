import type Subsquid from "../types/subsquid";
import type { IProfile } from "../types/Profile";

import { Network } from "../types/kubernetes";
import createNetwork from "./createNetwork";

import rootFs from "./rootFs";
import deploy from "./deploy";
import checkVMExist from "./prepareDeployment";

const { MachinesModel, DiskModel, GridClient, MachineModel, generateString } =
  window.configs?.grid3_client ?? {};

export default async function deploySubsquid(
  data: Subsquid,
  profile: IProfile
) {
  const deploymentInfo = await depoloySubsquidVM(data, profile);
  return { deploymentInfo };
}

async function depoloySubsquidVM(data: Subsquid, profile: IProfile) {
  const {
    name,
    cpu,
    memory,
    nodeId,
    diskSize,
    publicIp,
    planetary,
    endPoint,

  } = data;

  // sub deployments model (vm, disk, net): <type><random_suffix>
  let randomSuffix = generateString(10).toLowerCase();

  // Private network
  const network = createNetwork(
    new Network(`nw${randomSuffix}`, "10.200.0.0/16")
  );

  // Docker disk
  const disk = new DiskModel();
  disk.name = `disk${randomSuffix}`;
  disk.size = diskSize;
  disk.mountpoint = "/var/lib/docker";

  // Machine specs
  const machine = new MachineModel();

  machine.name = name; //`vm${randomSuffix}`;
  machine.cpu = cpu;
  machine.memory = memory;
  machine.disks = [disk];
  machine.node_id = nodeId;
  machine.public_ip = publicIp;
  machine.planetary = planetary;
  machine.flist =
    "https://hub.grid.tf/omarabdulaziz.3bot/omarabdul3ziz-sub-latest.flist";
  machine.qsfs_disks = [];
  machine.rootfs_size = rootFs(cpu, memory);
  machine.entrypoint = "/sbin/zinit init";
  machine.env = {
    SSH_KEY: profile.sshKey,
    CHAIN_ENDPOINT: endPoint,

  };

  // Machines specs
  const machines = new MachinesModel();
  machines.name = name;
  machines.machines = [machine];
  machines.network = network;
  machines.description = "subsquid node";
  // machines.metadata = "subsquid"

  const metadate = {
    type:  "vm",  
    name: name,
    projectName: "Subsquid",
  };
  machines.metadata = JSON.stringify(metadate);

  // Deploy
  return deploy(profile, "Subsquid", name, async (grid) => {
    await checkVMExist(grid, "subsquid", name);
    console.log("Machines:", machines);


    return grid.machines
      .deploy(machines)
      .then(() => grid.machines.getObj(name))
      .then(([vm]) => vm);
  });
}
