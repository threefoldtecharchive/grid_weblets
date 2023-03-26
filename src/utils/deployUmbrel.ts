import type { default as Umbrel } from "../types/umbrel";
import type { IProfile } from "../types/Profile";
import { Network } from "../types/kubernetes";

import createNetwork from "./createNetwork";
import deploy from "./deploy";
import rootFs from "./rootFs";
import checkVMExist from "./prepareDeployment";
import { InternalSolutionProviderID } from "./solutionProvider";

export default async function deployUmbrel(data: Umbrel, profile: IProfile) {
  const { generateString, MachineModel, MachinesModel, DiskModel } = window.configs.grid3_client;

  const {
    name,
    cpu,
    memory,
    nodeId,
    password,
    publicIp,
    username,
    disks: [{ size }],
  } = data;

  // umbrel deployments model (vm, disk, net): <type><random_suffix> and <type><random_suffix>U for umbrelDisk
  const randomSuffix = generateString(10).toLowerCase();

  // Network Specs
  const network = createNetwork(new Network(`nw${randomSuffix}`));

  /* Docker disk */
  const disk = new DiskModel();
  disk.name = `disk${randomSuffix}`;
  disk.size = 10;
  disk.mountpoint = "/var/lib/docker";

  /* Umbrel disk */
  const umbrel_disk = new DiskModel();
  umbrel_disk.name = `disk${randomSuffix}U`;
  umbrel_disk.size = size;
  umbrel_disk.mountpoint = "/umbrelDisk";
  // machine Specs
  const machine = new MachineModel();
  machine.name = name; //`machine${randomSuffix}`;
  machine.cpu = cpu;
  machine.memory = memory;
  machine.disks = [disk, umbrel_disk];
  machine.node_id = nodeId;
  machine.public_ip = publicIp;
  machine.planetary = true;
  machine.flist = "https://hub.grid.tf/tf-official-apps/umbrel-latest.flist";
  machine.rootfs_size = rootFs(cpu, memory);
  machine.entrypoint = "/sbin/zinit init";
  machine.solutionProviderID = InternalSolutionProviderID;

  machine.env = {
    SSH_KEY: profile.sshKey,
    USERNAME: username,
    PASSWORD: password,
    UMBREL_DISK: umbrel_disk.mountpoint,
  };

  // VMS Specs
  const vms = new MachinesModel();
  vms.name = name;
  vms.network = network;
  vms.machines = [machine];

  const metadate = {
    type: "vm",
    name: name,
    projectName: "Umbrel",
  };
  vms.metadata = JSON.stringify(metadate);

  // deploy
  return deploy(profile, "Umbrel", name, async grid => {
    await checkVMExist(grid, "Umbrel", name);
    return grid.machines
      .deploy(vms)
      .then(() => grid.machines.getObj(name))
      .then(([machine]) => machine);
  });
}
