import type Mattermost from "../types/mattermost";
import type { IProfile } from "../types/Profile";
import { Network } from "../types/kubernetes";

import { getUniqueDomainName, selectGatewayNode } from "./gatewayHelpers";
import createNetwork from "./createNetwork";
import deploy from "./deploy";
import rootFs from "./rootFs";
import destroy from "./destroy";
import checkVMExist, { checkGW } from "./prepareDeployment";

const {
  MachineModel,
  MachinesModel,
  GatewayNameModel,
  DiskModel,
  generateString,
} = window.configs?.grid3_client ?? {};

export default async function deployMattermost(
  profile: IProfile,
  mattermost: Mattermost
) {
  // gateway model: <solution-type><twin-id><solution_name>
  let domainName = await getUniqueDomainName(
    profile,
    mattermost.name,
    "mattermost"
  );

  let [publicNodeId, nodeDomain] = await selectGatewayNode();
  mattermost.domain = `${domainName}.${nodeDomain}`;

  const matterMostVm = await _deployMatterMost(profile, mattermost);
  const ip = matterMostVm["planetary"] as string;

  try {
    await _deployGateway(profile, domainName, ip, publicNodeId);
  } catch (err) {
    await destroy(profile, "mattermost", mattermost.name);
    throw err;
  }

  return matterMostVm;
}

function _deployMatterMost(profile: IProfile, mattermost: Mattermost) {
  const {
    name,
    username,
    password,
    server,
    domain,
    port,
    nodeId,
    cpu,
    memory,
    disks,
    publicIp,
    smtpPassword
  } = mattermost;

  let randomSuffix = generateString(10).toLowerCase();


  const vm = new MachineModel();
  vm.name = name;
  vm.node_id = nodeId;
  vm.disks = [];
  vm.public_ip = publicIp;
  vm.planetary = true;
  vm.cpu = cpu;
  vm.memory = memory;
  vm.rootfs_size = rootFs(cpu, memory);
  vm.flist = "https://hub.grid.tf/tf-official-apps/mattermost-latest.flist"; // prettier-ignore
  vm.entrypoint = "/sbin/zinit init";
  vm.env = {
    DB_PASSWORD: password,
    SITE_URL: "https://" + domain,
    SMTPUsername: username,
    SMTPPassword: smtpPassword,
    SMTPServer: server,
    SMTPPort: port,
    SSH_KEY: profile.sshKey,
  };

  const vms = new MachinesModel();
  vms.name = name;
  vms.network = createNetwork(new Network());
  vms.machines = [vm];

  const metadate = {
    "type":  "vm",  
    "name": name,
    "projectName": "Mattermost"
  };
  vms.metadata = JSON.stringify(metadate);


  return deploy(profile, "Mattermost", name, async (grid) => {
    await checkVMExist(grid, "mattermost", name);

    return grid.machines
      .deploy(vms)
      .then(() => grid.machines.getObj(name))
      .then(([vm]) => vm);
  });
}

function _deployGateway(
  profile: IProfile,
  name: string,
  ip: string,
  nodeId: number
) {
  const gw = new GatewayNameModel();
  gw.name = name;
  gw.node_id = nodeId;
  gw.tls_passthrough = false;
  gw.backends = [`http://[${ip}]:8000`];

  const metadate = {
    "type":  "gateway",  
    "name": name,
    "projectName": "Mattermost"
  };
  gw.metadata = JSON.stringify(metadate);

  return deploy(profile, "GatewayName", name, async (grid) => {
    await checkGW(grid, name, "mattermost");
    return grid.gateway
      .deploy_name(gw)
      .then(() => grid.gateway.getObj(name))
      .then(([gw]) => gw);
  });
}
