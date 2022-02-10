import type Presearch from "../types/presearch";
import type { IProfile } from "../types/Profile";

import { Network } from "../types/kubernetes";
import createNetwork from "./createNetwork";

import rootFs from "./rootFs";
import deploy from "./deploy";

const { MachinesModel, DiskModel, GridClient, MachineModel, generateString } =
  window.configs?.grid3_client ?? {};
const { HTTPMessageBusClient } = window.configs?.client ?? {};

export default async function deployPresearch(
  data: Presearch,
  profile: IProfile
) {
  const name = data.name;
  const { mnemonics, storeSecret, networkEnv } = profile;

  const http = new HTTPMessageBusClient(0, "", "", "");
  const client = new GridClient(
    networkEnv as any,
    mnemonics,
    storeSecret,
    http,
    undefined,
    "tfkvstore" as any
  );

  await client.connect();

  return await depoloyPresearchVM(data, profile);
}

async function depoloyPresearchVM(data: Presearch, profile: IProfile) {
  const {
    name,
    cpu,
    memory,
    nodeId,
    diskSize,
    publicIp,
    planetary,
    preCode,
    privateRestoreKey,
    publicRestoreKey,
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
  machine.name = `vm${randomSuffix}`;
  machine.cpu = cpu;
  machine.memory = memory;
  machine.disks = [disk];
  machine.node_id = nodeId;
  machine.public_ip = true;
  machine.planetary = planetary;
  machine.flist =
    "https://hub.grid.tf/omarabdul3ziz.3bot/omarabdul3ziz-presearch-v2.2.flist";
  machine.qsfs_disks = [];
  machine.rootfs_size = rootFs(cpu, memory);
  machine.entrypoint = "/sbin/zinit init";
  machine.env = {
    SSH_KEY: profile.sshKey,
    PRESEARCH_REGISTRATION_CODE: preCode,
    PRESEARCH_BACKUP_PRI_KEY: privateRestoreKey,
    PRESEARCH_BACKUP_PUB_KEY: publicRestoreKey,
  };

  // Machines specs
  const machines = new MachinesModel();
  machines.name = name;
  machines.machines = [machine];
  machines.network = network;
  machines.description = "presearch node";

  // Deploy
  return deploy(profile, "Presearch", name, (grid) => {
    return grid.machines
      .deploy(machines)
      .then(() => grid.machines.getObj(name))
      .then(([vm]) => vm);
  });
}
