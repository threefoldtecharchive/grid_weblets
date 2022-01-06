import { Network } from "../types/kubernetes";
import type Mattermost from "../types/mattermost";
import type { IProfile } from "../types/Profile";
import createNetwork from "./createNetwork";
import deploy from "./deploy";
import { selectGatewayNode } from "./gatewayHelpers";
import getGrid from "./getGrid";
import rootFs from "./rootFs";
const { MachineModel, MachinesModel, GatewayNameModel } =
  window.configs?.grid3_client ?? {};

export default async function deployMattermost(
  profile: IProfile,
  mattermost: Mattermost
) {
  let [publicNodeId, nodeDomain] = await selectGatewayNode();
  const domain = `${mattermost.name}.${nodeDomain}`;

  mattermost.domain = domain;

  const matterMostVm = await _deployMatterMost(profile, mattermost);
  const ip = matterMostVm.planetary as string;

  try {
    await _deployGateway(profile, mattermost, ip, publicNodeId);
  } catch (err) {
    await getGrid(profile, (grid) => {
      return grid.machines.delete({ name: mattermost.name });
    });
    console.log("Error", err);
    throw err;
  }

  return matterMostVm;
}

function _deployMatterMost(profile: IProfile, mattermost: Mattermost) {
  const { name, username, password, server, domain, port, nodeId } = mattermost;

  const vm = new MachineModel();
  vm.name = name;
  vm.node_id = nodeId;
  vm.disks = [];
  vm.public_ip = true;
  vm.planetary = true;
  vm.cpu = 4;
  vm.memory = 8 * 1024;
  vm.rootfs_size = rootFs(4, 8 * 1024);
  vm.flist = "https://hub.grid.tf/omar0.3bot/omarelawady-mattermost-with-siteurl.flist"; // prettier-ignore
  vm.entrypoint = "/entrypoint.sh mattermost";
  vm.env = {
    DB_PASSWORD: password,
    SITE_URL: "https://" + domain,
    SMTPUsername: username,
    SMTPPassword: password,
    SMTPServer: server,
    SMTPPort: port,
    SSH_KEY: profile.sshKey,
  };

  const vms = new MachinesModel();
  vms.name = name;
  vms.network = createNetwork(new Network());
  vms.machines = [vm];

  return deploy(profile, "VM", name, (grid) => {
    return grid.machines
      .deploy(vms)
      .then(() => grid.machines.getObj(name))
      .then(([vm]) => vm);
  });
}

function _deployGateway(
  profile: IProfile,
  { name }: Mattermost,
  ip: string,
  nodeId: number
) {
  const gw = new GatewayNameModel();
  gw.name = name;
  gw.node_id = nodeId;
  gw.tls_passthrough = false;
  gw.backends = [`http://[${ip}]:8000`];

  return deploy(profile, "GatewayName", name, (grid) => {
    return grid.gateway
      .deploy_name(gw)
      .then(() => grid.gateway.getObj(name))
      .then(([gw]) => gw);
  });
}
