import type { default as VM } from "../types/vm";
import type { IProfile } from "../types/Profile";

import { getUniqueName, selectGatewayNode } from "./gatewayHelpers";

const { HTTPMessageBusClient } = window.configs?.client ?? {};
const {
  GridClient,
  NetworkModel,
  DiskModel,
  MachineModel,
  MachinesModel,
  GatewayNameModel,
} = window.configs?.grid3_client ?? {};

export default async function deployPeertube(data: VM, profile: IProfile) {
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
  name = await getUniqueName(client, name);
  console.log({ name });

  // Dynamically select node to deploy the gateway
  let [gwNodeId, gwDomain] = await selectGatewayNode();
  const domain = `${name}.${gwDomain}`;
  console.log({ gwNodeId });
  console.log({ domain });

  // define a network
  const network = new NetworkModel();
  network.name = name + "Net";
  network.ip_range = "10.1.0.0/16";

  // deploy the peertube
  await deployPeertubeVM(client, network, nodeId, name, domain);

  // get the info of peertube deployment
  const peertubeInfo = await getPeertubeInfo(client, name + "VMs");
  console.log({ peertubeInfo });
  const planetaryIP = peertubeInfo[0]["planetary"];
  console.log({ planetaryIP });

  // deploy the gateway
  await deployPrefixGateway(client, name, planetaryIP, gwNodeId);

  // get the info of the deployed gateway
  const gatewayInfo = await getGatewayInfo(client, name);
  const gatewayDomain = gatewayInfo[0]["domain"];
  console.log({ gatewayDomain });
  return { domain, planetaryIP };
}

async function deployPeertubeVM(
  client: any,
  net: any,
  nodeId: any,
  name: string,
  domain: string
) {
  // disk
  const disk = new DiskModel();
  disk.name = name + "Data";
  disk.size = 10;
  disk.mountpoint = "/data";

  // vm specs
  const vm = new MachineModel();
  vm.name = name + "VM";
  vm.node_id = nodeId;
  vm.disks = [disk];
  vm.public_ip = false;
  vm.planetary = true;
  vm.cpu = 3;
  vm.memory = 1024 * 4;
  vm.rootfs_size = 1;
  vm.flist =
    "https://hub.grid.tf/omarabdul3ziz.3bot/threefoldtech-peertube-v3.0.2.flist";
  vm.entrypoint = "/usr/local/bin/entrypoint.sh";
  vm.env = {
    PEERTUBE_ADMIN_EMAIL: "support@incubid.com",
    PEERTUBE_BIND_ADDRESS: "::",
    PEERTUBE_WEBSERVER_HOSTNAME: domain,
    PEERTUBE_WEBSERVER_PORT: "443",
    PEERTUBE_DB_SUFFIX: "_prod",
    PEERTUBE_DB_USERNAME: "peertube",
    PEERTUBE_DB_PASSWORD: "peertube",
  };

  // vms specs
  const vms = new MachinesModel();
  vms.name = name + "VMs";
  vms.network = net;
  vms.machines = [vm];

  // deploy
  window.configs.currentDeploymentStore.deploy("Peertube", name);
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
  gwNodeId: number
) {
  // define specs
  const gw = new GatewayNameModel();
  gw.name = name;
  gw.node_id = gwNodeId;
  gw.tls_passthrough = false;
  gw.backends = [`http://[${backend}]:9000`];

  window.configs.currentDeploymentStore.deploy("Peertube", name);
  // deploy
  return client.gateway.deploy_name(gw).then((res) => {
    window.configs.baseConfig.updateBalance();
    window.configs.currentDeploymentStore.clear();
    return res;
  });
}

async function getPeertubeInfo(client: any, name: string) {
  const info = await client.machines.getObj(name);
  return info;
}

async function getGatewayInfo(client: any, name: string) {
  const info = await client.gateway.getObj(name);
  return info;
}
