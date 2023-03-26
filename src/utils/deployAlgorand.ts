import type Algorand from "../types/algorand";
import type { IProfile } from "../types/Profile";

import { Network } from "../types/kubernetes";
import createNetwork from "./createNetwork";

import deploy from "./deploy";
import checkVMExist from "./prepareDeployment";
import { InternalSolutionProviderID } from "./solutionProvider";

export default async function deployAlgorand(data: Algorand, profile: IProfile) {
  const deploymentInfo = await depoloyAlgorandVM(data, profile);
  return { deploymentInfo };
}

async function depoloyAlgorandVM(data: Algorand, profile: IProfile) {
  const { MachinesModel, DiskModel, MachineModel, generateString } = window.configs.grid3_client;
  const {
    name,
    cpu,
    memory,
    nodeId,
    rootSize,
    publicIp,
    planetary,
    nodeNetwork,
    mnemonics,
    firstRound,
    lastRound,
    nodeType,
  } = data;

  // sub deployments model (vm, disk, net): <type><random_suffix>
  const randomSuffix = generateString(10).toLowerCase();

  // Private network
  const network = createNetwork(new Network(`nw${randomSuffix}`, "10.200.0.0/16"));

  // Disk Specs
  const disk = new DiskModel();
  disk.name = `disk${randomSuffix}`;
  disk.size = 50;
  disk.mountpoint = "/var/lib/docker";

  // Machine specs
  const machine = new MachineModel();
  machine.name = name; //`vm${randomSuffix}`;
  machine.cpu = cpu;
  machine.memory = memory;
  machine.disks = nodeType == "indexer" ? [disk] : [];
  machine.node_id = nodeId;
  machine.public_ip = publicIp;
  machine.planetary = planetary;
  machine.qsfs_disks = [];
  machine.rootfs_size = rootSize;
  machine.flist = "https://hub.grid.tf/tf-official-apps/algorand-latest.flist";
  machine.entrypoint = "/sbin/zinit init";
  machine.env = {
    SSH_KEY: profile.sshKey,
    NETWORK: nodeNetwork,
    NODE_TYPE: nodeType,
    ACCOUNT_MNEMONICS: mnemonics,
    FIRST_ROUND: `${firstRound}`,
    LAST_ROUND: `${lastRound}`,
  };
  machine.solutionProviderID = InternalSolutionProviderID;

  // Machines specs
  const machines = new MachinesModel();
  machines.name = name;
  machines.machines = [machine];
  machines.network = network;
  machines.description = "Algorand node";

  const metadate = {
    type: "vm",
    name: name,
    projectName: "Algorand",
  };
  machines.metadata = JSON.stringify(metadate);

  // Deploy
  return deploy(profile, "Algorand", name, async grid => {
    await checkVMExist(grid, "Algorand", name);

    return grid.machines
      .deploy(machines)
      .then(() => grid.machines.getObj(name))
      .then(([vm]) => vm);
  });
}
