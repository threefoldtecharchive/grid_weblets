import type Caprover from "../types/caprover";
import { Network } from "../types/kubernetes";
import type { IProfile } from "../types/Profile";
import checkVMExist from "./prepareDeployment";
import createNetwork from "./createNetwork";
import deploy from "./deploy";
import rootFs from "./rootFs";
import type { CapWorker } from "../types/caprover";

const CAPROVER_FLIST =
  "https://hub.grid.tf/tf-official-apps/tf-caprover-main.flist";

export default async function deployCaprover(
  data: Caprover,
  profile: IProfile
) {
  const { MachinesModel, DiskModel, MachineModel } =
    window.configs.grid3_client;
  const { name, memory, nodeId, publicKey, cpu, domain, diskSize, password } = data; // prettier-ignore

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
  machine.rootfs_size = rootFs(cpu, memory);
  machine.entrypoint = "/sbin/zinit init";
  machine.env = {
    SWM_NODE_MODE: "leader",
    CAPROVER_ROOT_DOMAIN: domain,
    CAPTAIN_IMAGE_VERSION: "v1.4.2",
    PUBLIC_KEY: publicKey,
    DEFAULT_PASSWORD: password,
    CAPTAIN_IS_DEBUG: "true",
  };

  const machines = new MachinesModel();
  machines.name = name;
  machines.machines = [machine];
  machines.network = network;
  machines.description = "caprover leader machine/node";

  const metadate = {
    type: "vm",
    name: name,
    projectName: "CapRover",
  };
  machines.metadata = JSON.stringify(metadate);

  return deploy(profile, "CapRover", name, async (grid) => {
    await checkVMExist(grid, "caprover", name);
    return grid.machines
      .deploy(machines)
      .then(() => grid.machines.getObj(name))
      .then(([vm]) => {
        data.publicIP = vm["publicIP"]["ip"].split("/")[0];
        return vm;
      });
  });
}

export async function deployWorker(publicIP: string, password: string, worker: CapWorker, profile: IProfile) {
  const { MachinesModel, DiskModel, MachineModel } =
    window.configs.grid3_client;

  const pair =  window.configs.keypair();
  var pub = pair.public;
  var priv = pair.private;

  // login
  const token = await fetch(`http://${publicIP}:3000/api/v2/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-namespace": "captain" },
    body: JSON.stringify({ "password": password })
  })
    .then((res) => {console.log(res); return res.status == 100 ? res["data"].token : ""})
    .catch((err) => {throw err;});

  console.log("rawda token", token);

  /* Docker disk */
  const disk = new DiskModel();
  disk.name = "data0";
  disk.size = worker.diskSize;
  disk.mountpoint = "/var/lib/docker";

  const machine = new MachineModel();
  machine.cpu = worker.cpu;
  machine.memory = worker.memory;
  machine.disks = [disk];
  machine.node_id = worker.nodeId;
  machine.public_ip = true;
  machine.name = `CRW${worker.name}`;
  machine.planetary = false;
  machine.flist = CAPROVER_FLIST;
  machine.qsfs_disks = [];
  machine.rootfs_size = rootFs(worker.cpu, worker.memory);
  machine.entrypoint = "/sbin/zinit init";
  machine.env = {
    SWM_NODE_MODE: "worker",
    SWMTKN: token,
    LEADER_PUBLIC_IP: publicIP,
    CAPTAIN_IMAGE_VERSION: "v1.4.2",
    PUBLIC_KEY: `${worker.publicKey}\n${pub}`,
    CAPTAIN_IS_DEBUG: "true",
  };

  const network = createNetwork(new Network(`NW${name}`, "10.200.0.0/16")); // prettier-ignore

  const machines = new MachinesModel();
  machines.name = worker.name;
  machines.machines = [machine];
  machines.network = network;
  machines.description = "caprover worker machine/node";

  const metadate = {
    "type":  "vm",  
    "name": worker.name,
    "projectName": "CapRover"
  };
  machines.metadata = JSON.stringify(metadate);

  const vm = deploy(profile, "CapRover", worker.name, async (grid) => {
    await checkVMExist(grid, "caprover", worker.name);
    return grid.machines
      .deploy(machines)
      .then(() => grid.machines.getObj(worker.name))
      .then(([vm]) => vm)
      .catch((err) => {throw err;});
  });

  console.log("rawda vm", vm);

  const worker_ip = vm["publicIP"].ip.split("/")[0];

  // add worker
  await fetch(`http://${publicIP}:3000/api/v2/user/system/nodes`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-namespace": "captain", "x-captain-auth": token },
    body: JSON.stringify({ "privateKey": priv, "remoteNodeIpAddress": worker_ip, "captainIpAddress": publicIP, "nodeType": "worker" })
  })
    .then((res) => {console.log(res); return res})
    .catch((err) => {throw err;});

  return vm;
}
