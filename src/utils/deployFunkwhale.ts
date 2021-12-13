import type { default as VM, Disk, Env } from "../types/vm";
import type { IProfile } from "../types/Profile";
import { getSuitableGateway } from "./getValidGateway";
import { getNodeDomain } from "./gatewayNode";

const { HTTPMessageBusClient } = window.configs?.client ?? {};
const {
  DiskModel,
  MachineModel,
  MachinesModel,
  GridClient,
  GatewayNameModel,
  NetworkModel,
  Nodes,
} = window.configs?.grid3_client ?? {};

export let domain, funkYggIp;

export default async function deployFunkwhale(data: VM, profile: IProfile) {
  const { envs, disks, ...base } = data;
  let { name, flist, cpu, memory, entrypoint, network: nw } = base;
  const { publicIp, planetary, nodeId, rootFsSize } = base;
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

  await grid.connect();

  // Make sure the name is valid
  name = await getSuitableGateway(grid, name);
  console.log(name);

  // Gateway node Id and domain
  const gwNodeId = 8;
  const nodes = new Nodes(GridClient.config.graphqlURL, GridClient.config.rmbClient["proxyURL"]); // prettier-ignore
  const gwDomain = await getNodeDomain(nodes, gwNodeId);
  domain = `${name}.${gwDomain}`;

  const network = new NetworkModel();
  network.name = name + "NW";
  network.ip_range = "10.1.0.0/16";

  await deployFunkwhaleVM(grid, name, network, nodeId, domain);

  const info = await getFunkwhaleInfo(grid, name);
  funkYggIp = info[0]["planetary"];

  await deployPrefixGateway(grid, name, funkYggIp);

  const gatewayInfo = await getGatewayInfo(grid, name);

}

async function deployFunkwhaleVM(
  client: any,
  name: string,
  network: any,
  nodeId: number,
  gateway: string
) {
  const disk = new DiskModel();
  disk.name = name + "Disk";
  disk.size = 10;
  disk.mountpoint = "/data";

  const vm = new MachineModel();
  vm.name = name;
  vm.node_id = nodeId;

  vm.disks = [disk];
  vm.public_ip = false;
  vm.planetary = true;
  vm.cpu = 4;
  vm.memory = 8192;
  vm.rootfs_size = 2;
  vm.flist = "https://hub.grid.tf/omar0.3bot/omarelawady-funk-latest.flist";
  vm.entrypoint = "/init.sh";
  vm.env = {
    FUNKWHALE_HOSTNAME: gateway,
  };
  const vms = new MachinesModel();
  vms.name = name;
  vms.network = network;
  vms.machines = [vm];
  return client.machines.deploy(vms).then((res) => {
    window.configs.baseConfig.updateBalance();
    return res;
  });
}

async function deployPrefixGateway(client: any, name: string, backend: string) {
  // define specs
  const gw = new GatewayNameModel();
  gw.name = name;
  gw.node_id = 8;
  gw.tls_passthrough = false;
  gw.backends = [`http://[${backend}]:80/`];

  window.configs.currentDeploymentStore.deploy("Funkwhale", name);
  // deploy
  return client.gateway.deploy_name(gw).finally(() => {
    window.configs.currentDeploymentStore.clear();
  });
}

async function getFunkwhaleInfo(client: any, name: string) {
  const info = await client.machines.getObj(name);
  return info;
}

async function getGatewayInfo(client: any, name: string) {
  const info = await client.gateway.getObj(name);
  return info;
}
