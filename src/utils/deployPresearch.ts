import type Presearch from "../types/presearch";
import type { IProfile } from "../types/Profile";

import { Network } from "../types/kubernetes";
import createNetwork from "./createNetwork";

import rootFs from "./rootFs";
import deploy from "./deploy";
import checkVMExist from "./prepareDeployment";
import { InternalSolutionProviderID } from "./solutionProvider";

export default async function deployPresearch(data: Presearch, profile: IProfile) {
  const deploymentInfo = await depoloyPresearchVM(data, profile);
  return { deploymentInfo };
}

async function depoloyPresearchVM(data: Presearch, profile: IProfile) {
  const { MachinesModel, MachineModel, generateString } = window.configs.grid3_client;

  const { name, cpu, memory, nodeId, publicIp, planetary, preCode, privateRestoreKey, publicRestoreKey } = data;

  // sub deployments model (vm, disk, net): <type><random_suffix>
  const randomSuffix = generateString(10).toLowerCase();

  // Private network
  const network = createNetwork(new Network(`nw${randomSuffix}`, "10.200.0.0/16"));

  // Machine specs
  const machine = new MachineModel();
  machine.name = name; //`vm${randomSuffix}`;
  machine.cpu = cpu;
  machine.memory = memory;
  machine.disks = [];
  machine.node_id = nodeId;
  machine.public_ip = publicIp;
  machine.planetary = planetary;
  machine.flist = "https://hub.grid.tf/tf-official-apps/presearch-v2.2.flist";
  machine.qsfs_disks = [];
  machine.rootfs_size = rootFs(cpu, memory);
  machine.entrypoint = "/sbin/zinit init";
  machine.env = {
    SSH_KEY: profile.sshKey,
    PRESEARCH_REGISTRATION_CODE: preCode,
    PRESEARCH_BACKUP_PRI_KEY: privateRestoreKey,
    PRESEARCH_BACKUP_PUB_KEY: publicRestoreKey,
  };
  machine.solutionProviderID = InternalSolutionProviderID;

  // Machines specs
  const machines = new MachinesModel();
  machines.name = name;
  machines.machines = [machine];
  machines.network = network;
  machines.description = "presearch node";

  const metadate = {
    type: "vm",
    name: name,
    projectName: "Presearch",
  };
  machines.metadata = JSON.stringify(metadate);

  // Deploy
  return deploy(profile, "Presearch", name, async grid => {
    await checkVMExist(grid, "Presearch", name);

    return grid.machines
      .deploy(machines)
      .then(() => grid.machines.getObj(name))
      .then(([vm]) => vm);
  });
}
