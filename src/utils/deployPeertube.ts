import type { default as VM } from "../types/vm";
import type { IProfile } from "../types/Profile";

import {
  isValidName,
  checkSuitableName,
  getSuitableGateway,
} from "./getValidGateway";
import { gatewayNodes, getNodeDomain } from "./gatewayNode";

const { HTTPMessageBusClient } = window.configs?.client ?? {};
const {
  GridClient,
  NetworkModel,
  DiskModel,
  MachineModel,
  MachinesModel,
  GatewayNameModel,
  Nodes,
} = window.configs?.grid3_client ?? {};

export let domain, peertubeYggIp;

export default async function deployPeertube(data: VM, profile: IProfile) {
  // connect
  const { envs, disks, ...base } = data;
  let { name, flist, cpu, memory, entrypoint, network: nw } = base;
  const { publicIp, planetary, nodeId, rootFsSize } = base;
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

  // Make sure the name is valid
  name = await getSuitableGateway(client, name);
  // console.log(name);

  // Gateway node Id and domain
  const gwNodeId = 8;
  const nodes = new Nodes(GridClient.config.graphqlURL, GridClient.config.rmbClient["proxyURL"]); // prettier-ignore
  const gwDomain = await getNodeDomain(nodes, gwNodeId);
  domain = `${name}.${gwDomain}`;
  // console.log(gateway);

  // // define a network
  const network = new NetworkModel();
  network.name = name + "NW";
  network.ip_range = "10.1.0.0/16";

  // // deploy redis
  await deployRedis(client, network, nodeId, name);

  // // get the info
  const redisInfo = await getRedisInfo(client, name + "RVMs");
  const redisIP = redisInfo[0]["interfaces"][0]["ip"];

  // // deploy postgres
  await deployPostgres(client, network, nodeId, name);

  // // get the info
  const postgresInfo = await getPostgresInfo(client, name + "PGVMs");
  const postgresIP = postgresInfo[0]["interfaces"][0]["ip"];

  // // deploy the peertube
  await deployPeertubeVM(
    client,
    network,
    redisIP,
    postgresIP,
    nodeId,
    name,
    domain
  );

  // // get the info
  const peertubeInfo = await getPeertubeInfo(client, name + "PTVMs");
  peertubeYggIp = peertubeInfo[0]["yggIP"];

  // deploy the gateway
  await deployPrefixGateway(client, name, peertubeYggIp, gwNodeId);

  // // return the info
  const gatewayInfo = await getGatewayInfo(client, name);
  const gatewayDomain = gatewayInfo[0]["domain"];

  // // Expected gateway
  // console.log(gateway);
  // // Deployed gateway
  // console.log(gatewayDomain);
}

async function deployRedis(client: any, net: any, nodeId: any, name: string) {
  // disk
  const disk1 = new DiskModel();
  disk1.name = name + "Disk";
  disk1.size = 10;
  disk1.mountpoint = "/data";

  // vm specs
  const vm1 = new MachineModel();
  vm1.name = name + "RVM";
  vm1.node_id = nodeId;
  vm1.disks = [disk1];
  vm1.public_ip = false;
  vm1.planetary = true;
  vm1.cpu = 1;
  vm1.memory = 256;
  vm1.rootfs_size = 1;
  vm1.flist = "https://hub.grid.tf/omar0.3bot/omarelawady-redis-grid3.flist";
  vm1.entrypoint = "/start.sh";
  vm1.env = {
    PASSWORD: "omar123456",
  };

  // vms specs
  const vms = new MachinesModel();
  vms.name = name + "RVMs";
  vms.network = net;
  vms.machines = [vm1];

  // deploy
  return client.machines.deploy(vms);
}

async function deployPostgres(
  client: any,
  net: any,
  nodeId: any,
  name: string
) {
  // disk
  const disk2 = new DiskModel();
  disk2.name = name + "Disk";
  disk2.size = 10;
  disk2.mountpoint = "/var/lib/postgresql/data";

  // vm specs
  const vm2 = new MachineModel();
  vm2.name = name + "PGVM";
  vm2.node_id = nodeId;
  vm2.disks = [disk2];
  vm2.public_ip = false;
  vm2.planetary = true;
  vm2.cpu = 1;
  vm2.memory = 256;
  vm2.rootfs_size = 1;
  vm2.flist = "https://hub.grid.tf/omar0.3bot/omarelawady-postgres-grid3.flist";
  vm2.entrypoint = "/start.sh";
  vm2.env = {
    POSTGRES_PASSWORD: "omar123456",
    POSTGRES_DB: "peertube_prod",
    PGDATA: "/var/lib/postgresql/data",
  };

  // vms specs
  const vms = new MachinesModel();
  vms.name = name + "PGVMs";
  vms.network = net;
  vms.machines = [vm2];

  // deploy
  return client.machines.deploy(vms);
}

async function deployPeertubeVM(
  client: any,
  net: any,
  redisIp: string,
  postgresIp: string,
  nodeId: any,
  name: string,
  gateway: string
) {
  // disk
  const disk3 = new DiskModel();
  disk3.name = name + "Disk";
  disk3.size = 10;
  disk3.mountpoint = "/data";

  // vm specs
  const vm = new MachineModel();
  vm.name = name + "PTVM";
  vm.node_id = nodeId;
  vm.disks = [disk3];
  vm.public_ip = false;
  vm.planetary = true;
  vm.cpu = 3;
  vm.memory = 1024 * 2;
  vm.rootfs_size = 1;
  vm.flist =
    "https://hub.grid.tf/omar0.3bot/omarelawady-peertube-grid3-tfconnect.flist";
  vm.entrypoint = "/start.sh";
  vm.env = {
    PEERTUBE_BIND_ADDRESS: "::",
    PEERTUBE_WEBSERVER_HOSTNAME: gateway,
    PEERTUBE_DB_HOSTNAME: postgresIp,
    PEERTUBE_DB_USERNAME: "postgres",
    PEERTUBE_DB_PASSWORD: "omar123456",
    PEERTUBE_REDIS_HOSTNAME: redisIp,
    PEERTUBE_REDIS_AUTH: "omar123456",
  };

  // vms specs
  const vms = new MachinesModel();
  vms.name = name + "PTVMs";
  vms.network = net;
  vms.machines = [vm];

  // deploy
  return client.machines.deploy(vms);
}

async function deployPrefixGateway(
  client: any,
  name: string,
  backend: string,
  gwNodeId: number
) {
  // define specs
  const gw = new GatewayNameModel();
  gw.name = name;
  gw.node_id = gwNodeId;
  gw.tls_passthrough = false;
  gw.backends = [`http://[${backend}]:3000/`];

  window.configs.currentDeploymentStore.deploy("Peertube", name);
  // deploy
  return client.gateway.deploy_name(gw).then((res) => {
    window.configs.baseConfig.updateBalance();
    window.configs.currentDeploymentStore.clear();
    return res;
  });
}

async function getRedisInfo(client: any, name: string) {
  const info = await client.machines.getObj(name);
  return info;
}

async function getPostgresInfo(client: any, name: string) {
  const info = await client.machines.getObj(name);
  return info;
}

async function getPeertubeInfo(client: any, name: string) {
  const info = await client.machines.getObj(name);
  return info;
}

async function getGatewayInfo(client: any, name: string) {
  const info = await client.gateway.getObj(name);
  return info;
}
