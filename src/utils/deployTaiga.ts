import type { default as Taiga } from "../types/taiga";
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

export default async function deployTaiga(data: Taiga, profile: IProfile) {
  const { envs, disks:[{size}], adminUsername, adminEmail, adminPassword, smtpFromEmail, smtpHost, smtpPort, smtpHostPassword, smtpHostUser, smtpUseTLS, smtpUseSSL, ...base } = data;
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
    adminUsername,
    adminEmail,
    adminPassword,
    sshKey,
    smtpFromEmail,
    smtpHost,
    smtpPort,
    smtpHostUser,
    smtpHostPassword,
    smtpUseTLS,
    smtpUseSSL,
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
    // rollback the TaigaVM if the gateway fails to deploy
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
  adminUsername: string,
  adminEmail: string,
  adminPassword: string,
  sshKey: string,
  smtpFromEmail: string,
  smtpHost: string,
  smtpPort: string, 
  smtpHostUser: string,
  smtpHostPassword: string,
  smtpUseTLS,
  smtpUseSSL,
  randomSuffix: string,
) {
  const disk = new DiskModel();
  disk.name = `disk${randomSuffix}`;
  disk.size = diskSize;
  disk.mountpoint = "/var/lib/docker";

  const vm = new MachineModel();
  vm.name = `vm${randomSuffix}`;
  vm.node_id = nodeId;
  vm.disks = [disk];
  vm.public_ip = false;
  vm.planetary = true;
  vm.cpu = cpu;
  vm.memory = memory;
  vm.rootfs_size = 50;
  vm.flist =
    "https://hub.grid.tf/samehabouelsaad.3bot/abouelsaad-grid3_taiga_docker-latest.flist";
  vm.entrypoint = "/sbin/zinit init";
  vm.env = {
    SSH_KEY: sshKey,
    DOMAIN_NAME: domain,
    ADMIN_USERNAME: adminUsername,
    ADMIN_PASSWORD: adminPassword,
    ADMIN_EMAIL: adminEmail,
    DEFAULT_FROM_EMAIL: smtpFromEmail,
    EMAIL_USE_TLS: smtpUseTLS ? "True" : "False" ,
    EMAIL_USE_SSL: smtpUseSSL ? "True": "False",
    EMAIL_HOST: smtpHost,
    EMAIL_PORT: `${ smtpPort }`,
    EMAIL_HOST_USER: smtpHostUser,
    EMAIL_HOST_PASSWORD: smtpHostPassword
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
