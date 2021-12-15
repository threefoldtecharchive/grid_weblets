import type { default as VM } from "../types/vm";
import type { IProfile } from "../types/Profile";

import { getSuitableGateway } from "./getValidGateway";
import { selectGatewayNode } from "./gatewayHelpers";

const { HTTPMessageBusClient } = window.configs?.client ?? {};
const {
  DiskModel,
  MachineModel,
  MachinesModel,
  GridClient,
  GatewayNameModel,
  NetworkModel,
} = window.configs?.grid3_client ?? {};

export default async function deployFunkwhale(data: VM, profile: IProfile) {
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
  console.log({ name });

  // Gateway node Id and domain
  let [gwNodeId, gwDomain] = await selectGatewayNode();
  const domain = `${name}.${gwDomain}`;
  console.log({ gwNodeId });
  console.log({ domain });

  // define network
  const network = new NetworkModel();
  network.name = name + "Net";
  network.ip_range = "10.1.0.0/16";

  await deployFunkwhaleVM(client, name, network, nodeId, domain);

  const info = await getFunkwhaleInfo(client, name + "VMs");
  console.log({ info });
  const planetaryIP = info[0]["planetary"];
  console.log({ planetaryIP });

  await deployPrefixGateway(client, name, planetaryIP, gwNodeId);

  const gatewayInfo = await getGatewayInfo(client, name);
  console.log({ gatewayInfo });
  return { domain, planetaryIP };
}

async function deployFunkwhaleVM(
  client: any,
  name: string,
  network: any,
  nodeId: number,
  domain: string
) {
  const disk = new DiskModel();
  disk.name = name + "Disk";
  disk.size = 10;
  disk.mountpoint = "/data";

  const vm = new MachineModel();
  vm.name = name + "VM";
  vm.node_id = nodeId;
  vm.disks = [disk];
  vm.public_ip = false;
  vm.planetary = true;
  vm.cpu = 2;
  vm.memory = 1024 * 2;
  vm.rootfs_size = 2;
  vm.flist = "https://hub.grid.tf/omar0.3bot/omarelawady-funk-latest.flist";
  vm.entrypoint = "/init.sh";
  vm.env = {
    FUNKWHALE_HOSTNAME: domain,
  };

  const vms = new MachinesModel();
  vms.name = name + "VMs";
  vms.network = network;
  vms.machines = [vm];

  window.configs.currentDeploymentStore.deploy("Funkwhale", name);
  return client.machines
    .deploy(vms)
    .then((res) => {
      window.configs.baseConfig.updateBalance();
      return res;
    })
    .finally(() => {
      window.configs.currentDeploymentStore.clear();
    });
}

async function deployPrefixGateway(
  client: any,
  name: string,
  backend: string,
  nodeId: number
) {
  const gw = new GatewayNameModel();
  gw.name = name;
  gw.node_id = nodeId;
  gw.tls_passthrough = false;
  gw.backends = [`http://[${backend}]:80/`];

  window.configs.currentDeploymentStore.deploy("Funkwhale", name);
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
