import type { default as Wordpress } from "../types/wordpress";
import type { IProfile } from "../types/Profile";
import { Network } from "../types/kubernetes";

import { getUniqueDomainName, GatewayNodes, selectSpecificGatewayNode } from "./gatewayHelpers";
import createNetwork from "./createNetwork";
import deploy from "./deploy";
import rootFs from "./rootFs";
import destroy from "./destroy";
import checkVMExist, { checkGW } from "./prepareDeployment";
import { InternalSolutionProviderID } from "./solutionProvider";

export default async function deployWordpress(data: Wordpress, profile: IProfile, gateway: GatewayNodes) {
  // gateway model: <solution-type><twin-id><solution_name>
  const domainName = await getUniqueDomainName(profile, data.name, "Wordpress");

  // Dynamically select node to deploy the gateway
  const [publicNodeId, nodeDomain] = selectSpecificGatewayNode(gateway);

  data.domain = `http://${domainName}.${nodeDomain}`;

  // deploy wordpress instance
  const deploymentInfo = await deployWordpressVM(profile, data);

  const planetaryIP = deploymentInfo["planetary"] as string;

  try {
    // deploy the gateway
    await deployPrefixGateway(profile, domainName, planetaryIP, publicNodeId);
  } catch (error) {
    // rollback wordpress deployment if gateway deployment failed
    await destroy(profile, "Wordpress", data.name);
    throw error;
  }

  return { deploymentInfo };
}

async function deployPrefixGateway(profile: IProfile, domainName: string, backend: string, publicNodeId: number) {
  const { GatewayNameModel } = window.configs.grid3_client;
  // Gateway Specs
  const gw = new GatewayNameModel();
  gw.name = domainName;
  gw.node_id = publicNodeId;
  gw.tls_passthrough = false;
  gw.backends = [`http://[${backend}]:80`];
  gw.solutionProviderID = InternalSolutionProviderID;

  const metadate = {
    type: "gateway",
    name: domainName,
    projectName: "Wordpress",
  };
  gw.metadata = JSON.stringify(metadate);

  return deploy(profile, "GatewayName", domainName, async grid => {
    await checkGW(grid, domainName, "Wordpress");
    return grid.gateway
      .deploy_name(gw)
      .then(() => grid.gateway.getObj(domainName))
      .then(([gw]) => gw);
  });
}

async function deployWordpressVM(profile: IProfile, data: Wordpress) {
  const { generateString, MachineModel, MachinesModel, DiskModel } = window.configs.grid3_client;

  const {
    name,
    cpu,
    memory,
    nodeId,
    domain,
    adminEmail,
    adminPassword,
    adminUsername,
    disks: [{ size }],
  } = data;

  // wp deployments model (vm, disk, net): <type><random_suffix>
  const randomSuffix = generateString(10).toLowerCase();

  // Network Specs
  const network = createNetwork(new Network(`nw${randomSuffix}`));

  /* Docker disk */
  const disk = new DiskModel();
  disk.name = `disk${randomSuffix}`;
  disk.size = size;
  disk.mountpoint = "/var/www/html";

  // machine Specs
  const machine = new MachineModel();
  machine.name = name; //`machine${randomSuffix}`;
  machine.cpu = cpu;
  machine.memory = memory;
  machine.disks = [disk];
  machine.node_id = nodeId;
  machine.public_ip = false;
  machine.planetary = true;
  machine.flist = "https://hub.grid.tf/tf-official-apps/tf-wordpress-latest.flist";

  machine.rootfs_size = rootFs(cpu, memory);
  machine.entrypoint = "/sbin/zinit init";

  machine.env = {
    SSH_KEY: profile.sshKey,
    MYSQL_USER: adminUsername,
    MYSQL_PASSWORD: adminPassword,
    ADMIN_EMAIL: adminEmail,
    WP_URL: domain,
  };
  machine.solutionProviderID = InternalSolutionProviderID;

  // VMS Specs
  const vms = new MachinesModel();
  vms.name = name;
  vms.network = network;
  vms.machines = [machine];

  const metadate = {
    type: "vm",
    name: name,
    projectName: "Wordpress",
  };
  vms.metadata = JSON.stringify(metadate);

  // deploy
  return deploy(profile, "Wordpress", name, async grid => {
    await checkVMExist(grid, "Wordpress", name); // change the project name of the grid to be Wordpress
    return grid.machines
      .deploy(vms)
      .then(() => grid.machines.getObj(name))
      .then(([machine]) => machine);
  });
}
