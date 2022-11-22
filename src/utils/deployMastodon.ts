import type Mastodon from "../types/mastodon";
import type { IProfile } from "../types/Profile";
import { Network } from "../types/kubernetes";

import {
  GatewayNodes,
  getUniqueDomainName,
  selectGatewayNode,
  selectSpecificGatewayNode,
} from "./gatewayHelpers";
import createNetwork from "./createNetwork";
import deploy from "./deploy";
import rootFs from "./rootFs";
import destroy from "./destroy";
import checkVMExist, { checkGW } from "./prepareDeployment";

export default async function deployMastodon(
  profile: IProfile,
  mastodon: Mastodon,
  gateway: GatewayNodes
) {
  // gateway model: <solution-type><twin-id><solution_name>
  let domainName = await getUniqueDomainName(
    profile,
    mastodon.name,
    "mastodon"
  );

  let [publicNodeId, nodeDomain] = selectSpecificGatewayNode(gateway);
  mastodon.domain = `${domainName}.${nodeDomain}`;

  const mastodonVm = await _deployMastodon(profile, mastodon);
  const ip = mastodonVm["planetary"] as string;

  try {
    await _deployGateway(profile, domainName, ip, publicNodeId);
  } catch (err) {
    await destroy(profile, "mastodon", mastodon.name);
    throw err;
  }

  return mastodonVm;
}

function _deployMastodon(profile: IProfile, mastodon: Mastodon) {
  const { 
    DiskModel,
    MachineModel,
    MachinesModel,
    NetworkModel,
    generateString
  } = window.configs.grid3_client;

  const {
    name,
    adminUsername,
    adminPassword,
    adminEmail,
    domain,
    nodeId,

    SMTP_PORT,
    SMTP_EMAIL,
    SMTP_SERVER,
    SMTP_PASSWORD,

    cpu,
    memory,
    disks: [{ size }],
    publicIp,
  } = mastodon;

  let randomSuffix = generateString(10).toLowerCase();

  const network = new NetworkModel();
  network.name = `net${randomSuffix}`;
  network.ip_range = "10.1.0.0/16";

  const disk = new DiskModel();
  disk.name = `disk${randomSuffix}`;
  disk.size = size;
  disk.mountpoint = "/var/lib/docker";

  const vm = new MachineModel();
  vm.name = name;
  vm.node_id = nodeId;
  vm.disks = [disk];
  vm.public_ip = publicIp;
  vm.planetary = true;
  vm.cpu = cpu;
  vm.memory = memory;
  vm.rootfs_size = rootFs(cpu, memory);
  vm.flist = "https://hub.grid.tf/omda.3bot/mahmoudemmad-mastodon-latest.flist"; // requires update.
  vm.entrypoint = "/sbin/zinit init";
  vm.env = {
    LOCAL_DOMAIN: domain,

    SMTP_SERVER: SMTP_SERVER,
    SMTP_LOGIN: SMTP_EMAIL,
    SMTP_PASSWORD: SMTP_PASSWORD,
    SMTP_PORT: SMTP_PORT,

    SUPERUSER_USERNAME: adminUsername,
    SUPERUSER_EMAIL: adminEmail,
    SUPERUSER_PASSWORD: adminPassword,
    SSH_KEY: profile.sshKey,
  };

  const vms = new MachinesModel();
  vms.name = name;
  vms.network = network;
  vms.machines = [vm];

  const metadate = {
    type: "vm",
    name: name,
    projectName: "Mastodon",
  };
  vms.metadata = JSON.stringify(metadate);

  return deploy(profile, "Mastodon", name, async (grid) => {
    await checkVMExist(grid, "mastodon", name);
    try {
      await grid.zos.pingNode({ nodeId: vm.node_id });
      return grid.machines
        .deploy(vms)
        .then(() => grid.machines.getObj(name))
        .then(([vm]) => vm);
    } catch (error) {
      throw error;
    }
  });
}

function _deployGateway(
  profile: IProfile,
  name: string,
  ip: string,
  nodeId: number
) {
  const { GatewayNameModel } = window.configs.grid3_client;

  const gw = new GatewayNameModel();
  gw.name = name;
  gw.node_id = nodeId;
  gw.tls_passthrough = false;
  gw.backends = [`http://[${ip}]:3000`];

  const metadate = {
    type: "gateway",
    name: name,
    projectName: "Mastodon",
  };
  gw.metadata = JSON.stringify(metadate);

  return deploy(profile, "GatewayName", name, async (grid) => {
    await checkGW(grid, name, "mastodon");
    return grid.gateway
      .deploy_name(gw)
      .then(() => grid.gateway.getObj(name))
      .then(([gw]) => gw);
  });
}
