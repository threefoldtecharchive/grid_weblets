import type { default as Owncloud } from "../types/owncloud";
import type { IProfile } from "../types/Profile";
import checkVMExist, { checkGW } from "./prepareDeployment";
import deploy from "./deploy";
import destroy from "./destroy";
import { InternalSolutionProviderID } from "./solutionProvider";

import { getUniqueDomainName, GatewayNodes, selectSpecificGatewayNode } from "./gatewayHelpers";
import rootFs from "./rootFs";

export default async function deployOwncloud(data: Owncloud, profile: IProfile, gateway: GatewayNodes) {
  // gateway model: <solution-type><twin-id><solution_name>
  const domainName = await getUniqueDomainName(profile, data.name, "Owncloud");

  // Dynamically select node to deploy the gateway
  const [publicNodeId, nodeDomain] = selectSpecificGatewayNode(gateway);
  data.domain = `${domainName}.${nodeDomain}`;

  // deploy the owncloud
  const deploymentInfo = await deployOwncloudVM(profile, data);

  const planetaryIP = deploymentInfo["planetary"] as string;

  try {
    // deploy the gateway
    await deployPrefixGateway(profile, domainName, planetaryIP, publicNodeId);
  } catch (error) {
    // rollback owncloud deployment if gateway deployment failed
    await destroy(profile, "Owncloud", data.name);
    throw error;
  }

  return { deploymentInfo };
}

async function deployOwncloudVM(profile: IProfile, data: Owncloud) {
  const { DiskModel, MachineModel, MachinesModel, NetworkModel, generateString } = window.configs.grid3_client;

  const {
    adminUsername,
    adminPassword,
    smtpFromEmail,
    smtpHost,
    smtpPort,
    smtpHostPassword,
    smtpHostUser,
    smtpUseTLS,
    smtpUseSSL,
    cpu,
    memory,
    disks: [{ size }],
    name,
    nodeId,
    domain,
  } = data;

  // sub deployments model (vm, disk, net): <type><random_suffix>
  const randomSuffix = generateString(10).toLowerCase();

  // define a network
  const network = new NetworkModel();
  network.name = `net${randomSuffix}`;
  network.ip_range = "10.1.0.0/16";

  // disk
  const disk = new DiskModel();
  disk.name = `disk${randomSuffix}`;
  disk.size = size;
  disk.mountpoint = "/var/lib/docker";

  // vm specs
  const vm = new MachineModel();
  vm.name = name; //`vm${randomSuffix}`;
  vm.node_id = nodeId;
  vm.disks = [disk];
  vm.public_ip = false;
  vm.planetary = true;
  vm.cpu = cpu;
  vm.memory = memory;
  vm.rootfs_size = rootFs(cpu, memory);
  vm.flist = "https://hub.grid.tf/tf-official-apps/owncloud-10.9.1.flist";
  vm.entrypoint = "/sbin/zinit init";
  vm.solutionProviderID = InternalSolutionProviderID;

  let smtp_secure = "none";
  let emailName = "";
  let emailDomain = "";
  if (smtpUseTLS) {
    smtp_secure = "tls";
  } else if (smtpUseSSL) {
    smtp_secure = "ssl";
  }
  // check if smtpFromEmail parameter is not empty then extract the name and domain
  if (smtpFromEmail) {
    const email = smtpFromEmail.split("@");
    emailName = email[0];
    emailDomain = email[1];
  }
  vm.env = {
    SSH_KEY: profile.sshKey,
    OWNCLOUD_DOMAIN: domain,
    OWNCLOUD_ADMIN_USERNAME: adminUsername,
    OWNCLOUD_ADMIN_PASSWORD: adminPassword,
    OWNCLOUD_MAIL_SMTP_SECURE: smtp_secure,
    OWNCLOUD_MAIL_DOMAIN: emailDomain,
    OWNCLOUD_MAIL_FROM_ADDRESS: emailName,
    OWNCLOUD_MAIL_SMTP_HOST: smtpHost,
    OWNCLOUD_MAIL_SMTP_PORT: `${smtpPort}`,
    OWNCLOUD_MAIL_SMTP_NAME: smtpHostUser,
    OWNCLOUD_MAIL_SMTP_PASSWORD: smtpHostPassword,
  };

  // vms specs
  const vms = new MachinesModel();
  vms.name = name;
  vms.network = network;
  vms.machines = [vm];

  const metadate = {
    type: "vm",
    name: name,
    projectName: "Owncloud",
  };
  vms.metadata = JSON.stringify(metadate);

  // deploy
  return deploy(profile, "Owncloud", name, async grid => {
    await checkVMExist(grid, "Owncloud", name);

    return grid.machines
      .deploy(vms)
      .then(() => grid.machines.getObj(name))
      .then(([vm]) => vm);
  });
}

async function deployPrefixGateway(profile: IProfile, domainName: string, backend: string, publicNodeId: number) {
  const { GatewayNameModel } = window.configs.grid3_client;
  // define specs
  const gw = new GatewayNameModel();
  gw.name = domainName;
  gw.node_id = publicNodeId;
  gw.tls_passthrough = false;
  gw.backends = [`http://[${backend}]:80`];
  gw.solutionProviderID = InternalSolutionProviderID;

  const metadate = {
    type: "gateway",
    name: domainName,
    projectName: "Owncloud",
  };
  gw.metadata = JSON.stringify(metadate);

  return deploy(profile, "GatewayName", domainName, async grid => {
    await checkGW(grid, domainName, "Owncloud");
    return grid.gateway
      .deploy_name(gw)
      .then(() => grid.gateway.getObj(domainName))
      .then(([gw]) => gw);
  });
}
