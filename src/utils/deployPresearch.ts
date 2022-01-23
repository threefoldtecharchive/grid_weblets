import type Presearch from "../types/presearch";
import type { IProfile } from "../types/Profile";

import { Network } from "../types/kubernetes";
import createNetwork from "./createNetwork";

import rootFs from "./rootFs";
import deploy from "./deploy";

const { MachinesModel, DiskModel, GridClient, MachineModel, GatewayNameModel } =
  window.configs?.grid3_client ?? {};
const { HTTPMessageBusClient } = window.configs?.client ?? {};

export default async function deployDiscourse(
  data: Presearch,
  profile: IProfile
) {
  const name = data.name;
  const { mnemonics, storeSecret, networkEnv } = profile;

  const http = new HTTPMessageBusClient(0, "");
  const client = new GridClient(
    networkEnv as any,
    mnemonics,
    storeSecret,
    http,
    undefined,
    "tfkvstore" as any
  );

  await client.connect();

  await depoloyPresearchVM(data, profile);
}

async function depoloyPresearchVM(data: Presearch, profile: IProfile) {
  const { name, cpu, memory, nodeId, diskSize, publicIp, planetary, preCode } =
    data;

  // Private network
  const network = createNetwork(new Network(`nw${name}`, "10.200.0.0/16"));

  // Docker disk
  const disk = new DiskModel();
  disk.name = "data0";
  disk.size = diskSize;
  disk.mountpoint = "/var/lib/docker";

  // Machine specs
  const machine = new MachineModel();
  machine.name = name;
  machine.cpu = cpu;
  machine.memory = memory;
  machine.disks = [disk];
  machine.node_id = nodeId;
  machine.public_ip = true;
  machine.planetary = planetary;
  machine.flist =
    "https://hub.grid.tf/omarabdul3ziz.3bot/omarabdul3ziz-presearch-v1.0.flist";
  machine.qsfs_disks = [];
  machine.rootfs_size = rootFs(cpu, memory);
  machine.entrypoint = "/.init.sh";
  machine.env = {
    SSH_KEY: profile.sshKey,
    PRESEARCH_REGISTRATION_CODE: preCode,
  };
  console.log({ preCode });

  // Machines specs
  const machines = new MachinesModel();
  machines.name = name;
  machines.machines = [machine];
  machines.network = network;
  machines.description = "presearch node";

  // Deploy
  return deploy(profile, "Presearch", name, (grid) => {
    return grid.machines.deploy(machines);
  });
}
