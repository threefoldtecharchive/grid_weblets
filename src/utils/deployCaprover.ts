import type Caprover from "../types/caprover";
import { Network } from "../types/kubernetes";
import type { IProfile } from "../types/Profile";
import createNetwork from "./createNetwork";
const { HTTPMessageBusClient } = window.configs?.client ?? {};
const { MachinesModel, DiskModel, GridClient, MachineModel } =
  window.configs?.grid3_client ?? {};

const CAPROVER_FLIST =
  "https://hub.grid.tf/samehabouelsaad.3bot/tf-caprover-main-a4f186da8d.flist";

export default async function deployCaprover(
  data: Caprover,
  profile: IProfile
) {
  const { name, memory, nodeId, publicKey, cpu, domain, diskSize } = data;
  const { mnemonics, storeSecret, networkEnv } = profile;

  const http = new HTTPMessageBusClient(0, "");
  const network = createNetwork(new Network(`caprover_network_${name}`, "10.200.0.0/16")); // prettier-ignore

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
  machine.name = `caprover_leader_${name}`;
  machine.planetary = false;
  machine.flist = CAPROVER_FLIST;
  machine.qsfs_disks = [];
  machine.rootfs_size = 10;
  machine.entrypoint = "/sbin/zinit init";
  machine.env = {
    SWM_NODE_MODE: "leader",
    CAPROVER_ROOT_DOMAIN: domain,
    PUBLIC_KEY: publicKey,
  };

  const machines = new MachinesModel();
  machines.name = name;
  machines.machines = [machine];
  machines.network = network;
  machines.description = "caprover leader machine/node";

  const grid = new GridClient(
    networkEnv as any,
    mnemonics,
    storeSecret,
    http,
    undefined,
    "tfkvstore" as any
  );
  return grid.connect().then(() => grid.machines.deploy(machines));
}
