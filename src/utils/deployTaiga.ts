import type { default as Taiga } from "../types/taiga";
import type { IProfile } from "../types/Profile";
import deploy from "./deploy";

import { selectGatewayNode, getUniqueDomainName } from "./gatewayHelpers";
import rootFs from "./rootFs";
import destroy from "./destroy";
import checkVMExist, { checkGW } from "./prepareDeployment";

const {
  DiskModel,
  MachineModel,
  MachinesModel,
  GatewayNameModel,
  NetworkModel,
  generateString,
} = window.configs?.grid3_client ?? {};

export default async function deployTaiga(data: Taiga, profile: IProfile) {
  // gateway model: <solution-type><twin-id><solution_name>
  let domainName = await getUniqueDomainName(profile, data.name, "taiga");

  // Dynamically select node to deploy the gateway
  let [publicNodeId, nodeDomain] = await selectGatewayNode();
  data.domain = `${domainName}.${nodeDomain}`;

  const deploymentInfo = await deployTaigaVM(profile, data);

  const planetaryIP = deploymentInfo["planetary"] as string;

  try {
    // deploy the gateway
    await deployPrefixGateway(profile, domainName, planetaryIP, publicNodeId);
  } catch (error) {
    // rollback the TaigaVM if the gateway fails to deploy
    await destroy(profile, "taiga", data.name);
    throw error;
  }

  return { deploymentInfo };
}

async function deployTaigaVM(profile: IProfile, data: Taiga) {
  const {
    name,
    envs,
    disks: [{ size }],
    cpu,
    memory,
    publicIp,
    nodeId,
    domain,
    adminUsername,
    adminEmail,
    adminPassword,
    smtpFromEmail,
    smtpHost,
    smtpPort,
    smtpHostPassword,
    smtpHostUser,
    smtpUseTLS,
    smtpUseSSL,
  } = data;

  // sub deployments model (vm, disk, net): <type><random_suffix>
  let randomSuffix = generateString(10).toLowerCase();

  // define network
  const network = new NetworkModel();
  network.name = `net${randomSuffix}`;
  network.ip_range = "10.1.0.0/16";

  const disk = new DiskModel();
  disk.name = `disk${randomSuffix}`;
  disk.size = size;
  disk.mountpoint = "/var/lib/docker";

  const vm = new MachineModel();
  vm.name = name; //`vm${randomSuffix}`;
  vm.node_id = nodeId;
  vm.disks = [disk];
  vm.public_ip = publicIp;
  vm.planetary = true;
  vm.cpu = cpu;
  vm.memory = memory;
  vm.rootfs_size = rootFs(cpu, memory);
  vm.flist =
    "https://hub.grid.tf/tf-official-apps/grid3_taiga_docker-latest.flist";
  vm.entrypoint = "/sbin/zinit init";
  vm.env = {
    SSH_KEY: profile.sshKey,
    DOMAIN_NAME: domain,
    ADMIN_USERNAME: adminUsername,
    ADMIN_PASSWORD: adminPassword,
    ADMIN_EMAIL: adminEmail,
    DEFAULT_FROM_EMAIL: smtpFromEmail,
    EMAIL_USE_TLS: smtpUseTLS ? "True" : "False",
    EMAIL_USE_SSL: smtpUseSSL ? "True" : "False",
    EMAIL_HOST: smtpHost,
    EMAIL_PORT: `${smtpPort}`,
    EMAIL_HOST_USER: smtpHostUser,
    EMAIL_HOST_PASSWORD: smtpHostPassword,
  };

  const vms = new MachinesModel();
  vms.name = name;
  vms.network = network;
  vms.machines = [vm];

  const metadate = {
    "type":  "vm",  
    "name": name,
    "projectName": "Taiga"
  };
  vms.metadata = JSON.stringify(metadate);

  return deploy(profile, "Taiga", name, async (grid) => {
    await checkVMExist(grid, "taiga", name);

    return grid.machines
      .deploy(vms)
      .then(() => grid.machines.getObj(name))
      .then(([vm]) => vm);
  });
}

async function deployPrefixGateway(
  profile: IProfile,
  domainName: string,
  backend: string,
  publicNodeId: number
) {
  const gw = new GatewayNameModel();
  gw.name = domainName;
  gw.node_id = publicNodeId;
  gw.tls_passthrough = false;
  gw.backends = [`http://[${backend}]:9000/`];

  const metadate = {
    "type":  "gateway",  
    "name": domainName,
    "projectName": "Taiga"
  };
  gw.metadata = JSON.stringify(metadate);

  return deploy(profile, "GatewayName", domainName, async (grid) => {
    await checkGW(grid, domainName, "taiga");
    return grid.gateway
      .deploy_name(gw)
      .then(() => grid.gateway.getObj(domainName))
      .then(([gw]) => gw);
  });
}
