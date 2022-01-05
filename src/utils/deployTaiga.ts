import type { default as VM } from "../types/vm";
import type { IProfile } from "../types/Profile";
import deploy from "./deploy";

import { selectGatewayNode, getUniqueDomainName } from "./gatewayHelpers";
import rootFs from "./rootFs";

const { HTTPMessageBusClient } = window.configs?.client ?? {};
const {
  DiskModel,
  MachineModel,
  MachinesModel,
  GridClient,
  GatewayNameModel,
  NetworkModel,
  generateString,
} = window.configs?.grid3_client ?? {};

export default async function deployTaiga(data: VM, profile: IProfile) {
  const { envs, disks:[{size}], username, email, password, hostemail, ...base } = data;
  let { name, flist, cpu, memory, entrypoint, network: nw } = base;
  const { publicIp, planetary, nodeId } = base;
  const { mnemonics, storeSecret, networkEnv, sshKey} = profile;

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

  // sub deployments model (vm, disk, net): <type><random_suffix>
  let randomSuffix = generateString(10).toLowerCase();

  // gateway model: <solution-type><twin-id><solution_name>
  let domainName = await getUniqueDomainName(client, "tg", name);

  // Dynamically select node to deploy the gateway
  let [publicNodeId, nodeDomain] = await selectGatewayNode();
  const domain = `${domainName}.${nodeDomain}`;

  // define network
  const network = new NetworkModel();
  network.name = `net${randomSuffix}`;
  network.ip_range = "10.1.0.0/16";

  const deployment = await deployTaigaVM(
    profile,
    client,
    name,
    network,
    nodeId,
    cpu,
    memory,
    size,
    domain,
    username,
    email,
    password,
    sshKey,
    hostemail,
    randomSuffix,
  );

  const info = await getTaigaInfo(client, name);
  const planetaryIP = info[0]["planetary"];

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
    // rollback the FunkwhaleVM if the gateway fails to deploy
    await client.machines.delete({ name: name });
    throw error;
  }

  const gatewayInfo = await getGatewayInfo(client, domainName);
  return { deployment, domain, planetaryIP };
}

async function deployTaigaVM(
  profile: IProfile,
  client: any,
  name: string,
  network: any,
  nodeId: number,
  cpu: number,
  memory: number,
  diskSize: number,
  domain: string,
  username: string,
  email: string,
  password: string,
  sshKey: string,
  hostemail: string,
  randomSuffix: string,
) {
  const disk = new DiskModel();
  disk.name = `disk${randomSuffix}`;
  disk.size = diskSize;
  disk.mountpoint = "/data";

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
    "https://hub.grid.tf/samehabouelsaad.3bot/abouelsaad-taiga-test.flist";
  vm.entrypoint = "/sbin/zinit init";
  vm.env = {
    SSH_KEY: sshKey,
    DOMAIN_NAME: domain,
    DEFAULT_FROM_EMAIL: email,
    EMAIL_USE_TLS: "False",
    EMAIL_USE_SSL: "False",
    EMAIL_HOST: hostemail,
    EMAIL_PORT: "587",
    EMAIL_HOST_USER: username,
    EMAIL_HOST_PASSWORD: password
  };

  const vms = new MachinesModel();
  vms.name = name;
  vms.network = network;
  vms.machines = [vm];

  return deploy(profile, "VM", name, (grid) => {
    return grid.machines
      .deploy(vms)
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
  const gw = new GatewayNameModel();
  gw.name = domainName;
  gw.node_id = publicNodeId;
  gw.tls_passthrough = false;
  gw.backends = [`http://[${backend}]:9000/`];

  return deploy(profile, "GatewayName", domainName, (grid) => {
    return grid.gateway
      .deploy_name(gw)
      .then(() => grid.gateway.getObj(domainName))
      .then(([gw]) => gw);
  });
}

async function getTaigaInfo(client: any, name: string) {
  const info = await client.machines.getObj(name);
  return info;
}

async function getGatewayInfo(client: any, name: string) {
  const info = await client.gateway.getObj(name);
  return info;
}
