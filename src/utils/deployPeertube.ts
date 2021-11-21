import type { default as VM } from "../types/vm";
import type { IProfile } from "../types/Profile";

const { HTTPMessageBusClient } = window.configs?.client ?? {};
const { DiskModel, MachineModel, MachinesModel, GridClient, NetworkModel } =
  window.configs?.grid3_client ?? {};

export default async function deployPeertube(data: VM, profile: IProfile) {
  const { envs, disks, ...base } = data;
  const { name } = base;
  const { publicIp, planetary } = base;
  const { mnemonics, storeSecret, networkEnv } = profile;

  const http = new HTTPMessageBusClient(0, "");
  const grid = new GridClient(
    networkEnv as any,
    mnemonics,
    storeSecret,
    http,
    undefined,
    "tfkvstore" as any
  );

  // let netObj: Network;
  // netObj.name = "peertube_net";
  // netObj.ipRange = "10.1.0.0/16";

  // const net = createNetwork(netObj);

  const net = new NetworkModel();
  net.name = "peertube_net";
  net.ip_range = "10.1.0.0/16";

  const disk = new DiskModel();
  disk.name = "peertube_data";
  disk.size = 10;
  disk.mountpoint = "/data";

  const vm = new MachineModel();
  vm.name = name;
  vm.node_id = 7;
  vm.disks = [disk];
  vm.public_ip = publicIp;
  vm.planetary = planetary;
  vm.cpu = 3;
  vm.memory = 1024 * 2;
  vm.rootfs_size = 1;
  vm.flist =
    "https://hub.grid.tf/omar0.3bot/omarelawady-peertube-grid3-tfconnect.flist";
  vm.entrypoint = "/start.sh";
  vm.env = createEnvs({
    PEERTUBE_BIND_ADDRESS: "::",
    PEERTUBE_WEBSERVER_HOSTNAME: "peertube4.gent01.dev.grid.tf",
    PEERTUBE_DB_HOSTNAME: "10.1.4.3", // how should i know these? maybe guessing on each new network ip starts from 2: redis, 3: postgres, 4: peertube.
    PEERTUBE_DB_USERNAME: "postgres",
    PEERTUBE_DB_PASSWORD: "omar123456",
    PEERTUBE_REDIS_HOSTNAME: "10.1.4.2",
    PEERTUBE_REDIS_AUTH: "omar123456",
  });

  const vms = new MachinesModel();
  vms.name = name;
  vms.network = net;
  vms.machines = [vm];

  deployReqVMs(data, net, profile);

  return grid.connect().then(() => grid.machines.deploy(vms));
}

function createEnvs(envs): { [key: string]: string } {
  return envs.reduce((res, env) => {
    res[env.key] = env.value;
    return res;
  }, {});
}

export async function deployReqVMs(data: VM, n: any, profile: IProfile) {
  const { envs, disks, ...base } = data;
  const { name } = base;
  // const { publicIp, planetary, nodeId, rootFsSize } = base;
  const { mnemonics, storeSecret, networkEnv } = profile;

  const http = new HTTPMessageBusClient(0, "");
  const grid = new GridClient(
    networkEnv as any,
    mnemonics,
    storeSecret,
    http,
    undefined,
    "tfkvstore" as any
  );

  const disk1 = new DiskModel();
  disk1.name = "redis_data";
  disk1.size = 10;
  disk1.mountpoint = "/data";

  const vm1 = new MachineModel();
  vm1.name = "redis";
  vm1.node_id = 7;
  vm1.disks = [disk1];
  vm1.public_ip = false;
  vm1.planetary = true;
  vm1.cpu = 1;
  vm1.memory = 256;
  vm1.rootfs_size = 1;
  vm1.flist = "https://hub.grid.tf/omar0.3bot/omarelawady-redis-grid3.flist";
  vm1.entrypoint = "/start.sh";
  vm1.env = createEnvs({
    PASSWORD: "omar123456",
  });

  const disk2 = new DiskModel();
  disk2.name = "postgres_data";
  disk2.size = 10;
  disk2.mountpoint = "/var/lib/postgresql/data";

  const vm2 = new MachineModel();
  vm2.name = "postgres";
  vm2.node_id = 7;
  vm2.disks = [disk2];
  vm2.public_ip = false;
  vm2.planetary = true;
  vm2.cpu = 1;
  vm2.memory = 256;
  vm2.rootfs_size = 1;
  vm2.flist = "https://hub.grid.tf/omar0.3bot/omarelawady-postgres-grid3.flist";
  vm2.entrypoint = "/start.sh";
  vm2.env = createEnvs({
    POSTGRES_PASSWORD: "omar123456",
    POSTGRES_DB: "peertube_prod",
    PGDATA: "/var/lib/postgresql/data",
  });

  const vms = new MachinesModel();
  vms.name = name;
  vms.network = n;
  vms.machines = [vm1, vm2];

  return grid.connect().then(() => grid.machines.deploy(vms));
}
