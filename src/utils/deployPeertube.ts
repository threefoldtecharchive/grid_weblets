import type { default as VM } from "../types/vm";
import type { IProfile } from "../types/Profile";
import deploy from "./deploy";

import { selectGatewayNode, getUniqueDomainName } from "./gatewayHelpers";
import rootFs from "./rootFs";
import createNetwork from "./createNetwork";
import { Network } from "../types/kubernetes";

const { HTTPMessageBusClient } = window.configs?.client ?? {};
const {
  GridClient,
  DiskModel,
  MachineModel,
  MachinesModel,
  GatewayNameModel,
  generateString,
} = window.configs?.grid3_client ?? {};

export default async function deployPeertube(data: VM, profile: IProfile) {
  const {
    envs,
    disks: [{ size }],
    ...base
  } = data;
  let { name, flist, cpu, memory, entrypoint, network: nw } = base;
  const { publicIp, planetary, nodeId } = base;
  const { mnemonics, storeSecret, networkEnv, sshKey } = profile;

  const http = new HTTPMessageBusClient(0, "", "", "");
  const client = new GridClient(
    networkEnv as any,
    mnemonics,
    storeSecret,
    http,
    undefined,
    "tfkvstore" as any
  );

  await client.connect();

  // sub deployments model (vm, disk, net): <type><random_suffix>
  let randomSuffix = generateString(10).toLowerCase();

  // gateway model: <solution-type><twin-id><solution_name>
  let domainName = await getUniqueDomainName(client, "pt", name);

  // Dynamically select node to deploy the gateway
  let [publicNodeId, nodeDomain] = await selectGatewayNode();
  const domain = `${domainName}.${nodeDomain}`;

  // define a network
  const network = createNetwork(new Network(`net${randomSuffix}`, "10.1.0.0/16")); // prettier-ignore

  // deploy the peertube
  await deployPeertubeVM(
    profile,
    client,
    network,
    nodeId,
    name,
    domain,
    cpu,
    memory,
    size,
    sshKey,
    randomSuffix
  );

  // get the info of peertube deployment
  const peertubeInfo = await getPeertubeInfo(client, name);
  const planetaryIP = peertubeInfo[0]["planetary"];

  try {
    // deploy the gateway
    await deployPrefixGateway(
      profile,
      client,
      domainName,
      planetaryIP,
      publicNodeId
    );
  } catch (error) {
    // rollback peertube deployment if gateway deployment failed
    await client.machines.delete({ name: name });
    throw error;
  }

  // get the info of the deployed gateway
  const gatewayInfo = await getGatewayInfo(client, domainName);
  const gatewayDomain = gatewayInfo[0]["domain"];
  return { domain, planetaryIP };
}

async function deployPeertubeVM(
  profile: IProfile,
  client: any,
  net: any,
  nodeId: any,
  name: string,
  domain: string,
  cpu: number,
  memory: number,
  diskSize: number,
  sshKey: string,
  randomSuffix: string
) {
  // disk
  const disk = new DiskModel();
  disk.name = `disk${randomSuffix}`;
  disk.size = diskSize;
  disk.mountpoint = "/data";

  // vm specs
  const vm = new MachineModel();
  vm.name = `vm${randomSuffix}`;
  vm.node_id = nodeId;
  vm.disks = [disk];
  vm.public_ip = false;
  vm.planetary = true;
  vm.cpu = cpu;
  vm.memory = memory;
  vm.rootfs_size = rootFs(cpu, memory);
  vm.flist =
    "https://hub.grid.tf/tf-official-apps/threefoldtech-peertube-v3.0.flist";
  vm.entrypoint = "/usr/local/bin/entrypoint.sh";
  vm.env = {
    SSH_KEY: sshKey,
    PEERTUBE_ADMIN_EMAIL: "support@incubid.com",
    PEERTUBE_WEBSERVER_HOSTNAME: domain,
    PEERTUBE_WEBSERVER_PORT: "443",
    PEERTUBE_DB_SUFFIX: "_prod",
    PEERTUBE_DB_USERNAME: "peertube",
    PEERTUBE_DB_PASSWORD: "peertube",
  };

  // vms specs
  const vms = new MachinesModel();
  vms.name = name;
  vms.network = net;
  vms.machines = [vm];

  // deploy
  return deploy(profile, "Peertube", name, (grid) => {
    return grid.machines
      .deploy(vms)
      .then(async () => {
        for(const gw of await grid.gateway._list()){
          try {
            await grid.gateway.getObj(gw);
          }
          catch {}
        }
      })
      .then(() => grid.machines.getObj(name))
      .then(([vm]) => vm);
  });
}

async function deployPrefixGateway(
  profile: IProfile,
  client: any,
  domainName: string,
  backend: string,
  publicNodeId: number
) {
  // define specs
  const gw = new GatewayNameModel();
  gw.name = domainName;
  gw.node_id = publicNodeId;
  gw.tls_passthrough = false;
  gw.backends = [`http://[${backend}]:9000`];

  return deploy(profile, "GatewayName", domainName, (grid) => {
    return grid.gateway
      .deploy_name(gw)
      .then(() => grid.gateway.getObj(domainName))
      .then(([gw]) => gw);
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
