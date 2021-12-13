import type Caprover from "../types/caprover";
import { Network } from "../types/kubernetes";
import type { IProfile } from "../types/Profile";
import createNetwork from "./createNetwork";
import deploy from "./deploy";
import getGrid from "./getGrid";
// const { HTTPMessageBusClient } = window.configs?.client ?? {};
const { MachinesModel, DiskModel /* , GridClient */, MachineModel } =
  window.configs?.grid3_client ?? {};

const CAPROVER_FLIST =
  "https://hub.grid.tf/tf-official-apps/tf-caprover-main.flist";

export default async function deployCaprover(
  data: Caprover,
  profile: IProfile
) {
  const { name, memory, nodeId, publicKey, cpu, domain, diskSize, password } = data; // prettier-ignore

  // const http = new HTTPMessageBusClient(0, "");
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
  machine.name = `CRL${name}`;
  machine.planetary = false;
  machine.flist = CAPROVER_FLIST;
  machine.qsfs_disks = [];
  machine.rootfs_size = 10;
  machine.entrypoint = "/sbin/zinit init";
  machine.env = {
    SWM_NODE_MODE: "leader",
    CAPROVER_ROOT_DOMAIN: domain,
    PUBLIC_KEY: publicKey,
    DEFAULT_PASSWORD: password,
  };

  const machines = new MachinesModel();
  machines.name = name;
  machines.machines = [machine];
  machines.network = network;
  machines.description = "caprover leader machine/node";

  return deploy(profile, "CapRover", name, (grid) => {
    return grid.machines
      .deploy(machines)
      .then(() => grid.machines.getObj(name))
      .then(([vm]) => vm);
  });
}
