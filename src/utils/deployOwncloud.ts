import type { default as Owncloud } from "../types/owncloud";
import type { IProfile } from "../types/Profile";
import deploy from "./deploy";

import { selectGatewayNode, getUniqueDomainName } from "./gatewayHelpers";
import rootFs from "./rootFs";

const { HTTPMessageBusClient } = window.configs?.client ?? {};
const {
  GridClient,
  DiskModel,
  MachineModel,
  MachinesModel,
  GatewayNameModel,
  NetworkModel,
  generateString,
} = window.configs?.grid3_client ?? {};

export default async function deployOwncloud(
  data: Owncloud,
  profile: IProfile
) {
  const {
    envs,
    adminUsername,
    adminEmail,
    adminPassword,
    smtpHost,
    smtpPort,
    smtpHostPassword,
    smtpHostUser,
    cpu,
    memory,
    diskSize,
    ...base
  } = data;
  let { name, flist, entrypoint, network: nw } = base;
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
  let domainName = await getUniqueDomainName(client, "oc", name);

  // Dynamically select node to deploy the gateway
  let [publicNodeId, nodeDomain] = await selectGatewayNode();
  const domain = `${domainName}.${nodeDomain}`;

  // define a network
  const network = new NetworkModel();
  network.name = `net${randomSuffix}`;
  network.ip_range = "10.1.0.0/16";

  // deploy the owncloud
  const deploymentInfo = await deployOwncloudVM(
    profile,
    client,
    name,
    network,
    nodeId,
    domain,
    cpu,
    memory,
    diskSize,
    adminUsername,
    adminEmail,
    adminPassword,
    sshKey,
    smtpHost,
    smtpPort,
    smtpHostUser,
    smtpHostPassword,
    randomSuffix
  );

  // get the info of owncloud deployment
  const owncloudInfo = await getOwncloudInfo(client, name);
  const planetaryIP = owncloudInfo[0]["planetary"];

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
    // rollback owncloud deployment if gateway deployment failed
    await client.machines.delete({ name: name });
    throw error;
  }

  // get the info of the deployed gateway
  const gatewayInfo = await getGatewayInfo(client, domainName);
  const gatewayDomain = gatewayInfo[0]["domain"];
  return { deploymentInfo };
}

async function deployOwncloudVM(
  profile: IProfile,
  client: any,
  name: string,
  network: any,
  nodeId: number,
  domain: string,
  cpu: number,
  memory: number,
  diskSize: number,
  adminUsername: string,
  adminEmail: string,
  adminPassword: string,
  sshKey: string,
  smtpHost: string,
  smtpPort: string,
  smtpHostUser: string,
  smtpHostPassword: string,
  randomSuffix: string
) {
  // disk
  const disk = new DiskModel();
  disk.name = `disk${randomSuffix}`;
  disk.size = diskSize;
  disk.mountpoint = "/var/lib/docker";

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
    "https://hub.grid.tf/waleedhammam.3bot/waleedhammam-owncloud-latest.flist";
  vm.entrypoint = "/sbin/zinit init";
  vm.env = {
    SSH_KEY: sshKey,
    OWNCLOUD_HOST: domain,
    OWNCLOUD_USERNAME: adminUsername,
    OWNCLOUD_PASSWORD: adminPassword,
    OWNCLOUD_EMAIL: adminEmail,
    OWNCLOUD_SMTP_HOST: smtpHost,
    OWNCLOUD_SMTP_PORT_NUMBER: `${smtpPort}`,
    OWNCLOUD_SMTP_USER: smtpHostUser,
    OWNCLOUD_SMTP_PASSWORD: smtpHostPassword,
  };

  // vms specs
  const vms = new MachinesModel();
  vms.name = name;
  vms.network = network;
  vms.machines = [vm];

  // deploy
  return deploy(profile, "Owncloud", name, (grid) => {
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
  // define specs
  const gw = new GatewayNameModel();
  gw.name = domainName;
  gw.node_id = publicNodeId;
  gw.tls_passthrough = false;
  gw.backends = [`http://[${backend}]:80`];

  return deploy(profile, "GatewayName", domainName, (grid) => {
    return grid.gateway
      .deploy_name(gw)
      .then(() => grid.gateway.getObj(domainName))
      .then(([gw]) => gw);
  });
}

async function getOwncloudInfo(client: any, name: string) {
  const info = await client.machines.getObj(name);
  return info;
}

async function getGatewayInfo(client: any, name: string) {
  const info = await client.gateway.getObj(name);
  return info;
}
