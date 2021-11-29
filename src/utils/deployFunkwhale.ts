import type { default as VM, Disk, Env } from "../types/vm";
import createNetwork from "./createNetwork";
const { HTTPMessageBusClient } = window.configs?.client ?? {};
const { DiskModel, MachineModel, MachinesModel, GridClient, GatewayNameModel, NetworkModel, Nodes} =
  window.configs?.grid3_client ?? {};
import type { IProfile } from "../types/Profile";
import { getSuitableGateway } from "./getValidGateway";
import { getNodeDomain } from "./gatewayNode";

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

  const network = new NetworkModel();
  network.name = name + "NW";
  network.ip_range = "10.1.0.0/16";

  // Make sure the name is valid
  name = await getSuitableGateway(grid, name);
  console.log(name);

  // Gateway node Id and domain
  const gwNodeId = 8;
  const nodes = new Nodes(GridClient.config.graphqlURL, GridClient.config.rmbClient["proxyURL"]); // prettier-ignore
  const gwDomain = await getNodeDomain(nodes, gwNodeId);
  await deployFunkwhaleVM(grid, name, network, nodeId, gwDomain)

  const info = await getFunkwhaleInfo(grid, name);
  const funkYggIp = info[0]["yggIP"];

  await deployPrefixGateway(grid, name, funkYggIp);
  
  const gatewayInfo = await getGatewayInfo(grid, name);
  const gatewayDomain = gatewayInfo[0]["domain"];
  
  console.log(gatewayDomain);
}
async function deployFunkwhaleVM(client: any, name: string, network: any, nodeId: number, gwDomain: string ){
  const disk = new DiskModel();
  disk.name = "diskName";
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
      FUNKWHALE_HOSTNAME: name + ".gent01.dev.grid.tf",
  }
  const vms = new MachinesModel();
  vms.name = name;
  vms.network = network;
  vms.machines = [vm];
  return client.machines.deploy(vms);
}


async function deployPrefixGateway(client: any, name: string, backend: string) {
    // define specs
    const gw = new GatewayNameModel();
    gw.name = name;
    gw.node_id = 8;
    gw.tls_passthrough = false;
    gw.backends = [`http://[${backend}]:80/`];
  
    // deploy
    return client.gateway.deploy_name(gw);
}

async function getGatewayInfo(client: any, name: string) {
    const info = await client.gateway.getObj(name);
    return info;
}

async function getFunkwhaleInfo(client: any, name: string) {
    const info = await client.machines.getObj(name);
    return info;
  }