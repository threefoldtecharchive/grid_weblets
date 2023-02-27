import type { default as Umbrel } from "../types/umbrel";
import type { IProfile } from "../types/Profile";
import { Network } from "../types/kubernetes";

import createNetwork from "./createNetwork";
import deploy from "./deploy";
import rootFs from "./rootFs";
import checkVMExist from "./prepareDeployment";

export default async function deployUmbrel(data: Umbrel, profile: IProfile) {
  const { generateString, MachineModel, MachinesModel, DiskModel } = window.configs.grid3_client;

  const {
    name,
    cpu,
    memory,
    nodeId,
    umbrelDomain,
    password,
    publicIp,
    username,
    disks: [{ size }],
  } = data;

  // wp deployments model (vm, disk, net): <type><random_suffix>
  const randomSuffix = generateString(10).toLowerCase();

  // Network Specs
  const network = createNetwork(new Network(`nw${randomSuffix}`));

  /* Docker disk */
  const disk = new DiskModel();
  disk.name = `disk${randomSuffix}`;
  disk.size = size;
  disk.mountpoint = "/var/lib/docker";

  // machine Specs
  const machine = new MachineModel();
  machine.name = name; //`machine${randomSuffix}`;
  machine.cpu = cpu;
  machine.memory = memory;
  machine.disks = [disk];
  machine.node_id = nodeId;
  machine.public_ip = publicIp;
  machine.planetary = true;
  machine.flist = "https://hub.grid.tf/kassem.3bot/0om4r-umbrel-1.0.0.flist";

  machine.rootfs_size = rootFs(cpu, memory);
  machine.entrypoint = "/sbin/zinit init";

  machine.env = {
    SSH_KEY: profile.sshKey,
    USERNAME: username,
    PASSWORD: password,
    UMBREL_URL: umbrelDomain,
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
    await checkVMExist(grid, "umbrel", name); // change the project name of the grid to be Umbrel
    return grid.machines
      .deploy(vms)
      .then(() => grid.machines.getObj(name))
      .then(([machine]) => machine);
  });
}
