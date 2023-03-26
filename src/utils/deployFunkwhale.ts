import type { default as Funkwhale } from "../types/funkwhale";
import type { IProfile } from "../types/Profile";
import { Network } from "../types/kubernetes";

import { getUniqueDomainName, GatewayNodes, selectSpecificGatewayNode } from "./gatewayHelpers";
import createNetwork from "./createNetwork";
import deploy from "./deploy";
import rootFs from "./rootFs";
import destroy from "./destroy";
import checkVMExist, { checkGW } from "./prepareDeployment";
import { InternalSolutionProviderID } from "./solutionProvider";

export default async function deployFunkwhale(data: Funkwhale, profile: IProfile, gateway: GatewayNodes) {
  // gateway model: <solution-type><twin-id><solution_name>
  const domainName = await getUniqueDomainName(profile, data.name, "Funkwhale");

  // Dynamically select node to deploy the gateway
  const [publicNodeId, nodeDomain] = selectSpecificGatewayNode(gateway);
  data.domain = `${domainName}.${nodeDomain}`;

  const deploymentInfo = await deployFunkwhaleVM(profile, data);

  const planetaryIP = deploymentInfo["planetary"] as string;

  try {
    // deploy the gateway
    await deployPrefixGateway(profile, domainName, planetaryIP, publicNodeId);
  } catch (error) {
    // rollback the FunkwhaleVM if the gateway fails to deploy
    await destroy(profile, "Funkwhale", data.name);
    throw error;
  }

  return { deploymentInfo };
}

async function deployFunkwhaleVM(profile: IProfile, data: Funkwhale) {
  const { DiskModel, MachineModel, MachinesModel, generateString } = window.configs.grid3_client;

  const {
    name,
    cpu,
    memory,
    disks: [{ size }],
    publicIp,
    nodeId,
    adminEmail,
    adminUsername,
    adminPassword,
    domain,
  } = data;

  // sub deployments model (vm, disk, net): <type><random_suffix>
  const randomSuffix = generateString(10).toLowerCase();

  // Network Specs
  const net = new Network();
  net.name = `net${randomSuffix}`;
  const network = createNetwork(net);

  // Disk Specs
  const disk = new DiskModel();
  disk.name = `disk${randomSuffix}`;
  disk.size = size;
  disk.mountpoint = "/data";

  // VM Specs
  const vm = new MachineModel();
  vm.name = name; //`vm${randomSuffix}`;
  vm.node_id = nodeId;
  vm.disks = [disk];
  vm.public_ip = publicIp;
  vm.planetary = true;
  vm.cpu = cpu;
  vm.memory = memory;
  vm.rootfs_size = rootFs(cpu, memory);
  vm.flist = "https://hub.grid.tf/tf-official-apps/funkwhale-dec21.flist";
  vm.entrypoint = "/init.sh";
  vm.env = {
    FUNKWHALE_HOSTNAME: domain,
    DJANGO_SUPERUSER_EMAIL: adminEmail,
    DJANGO_SUPERUSER_USERNAME: adminUsername,
    DJANGO_SUPERUSER_PASSWORD: adminPassword,
  };
  vm.solutionProviderID = InternalSolutionProviderID;

  // VMS Specs
  const vms = new MachinesModel();
  vms.name = name;
  vms.network = network;
  vms.machines = [vm];

  const metadate = {
    type: "vm",
    name: name,
    projectName: "Funkwhale",
  };
  vms.metadata = JSON.stringify(metadate);

  return deploy(profile, "Funkwhale", name, async grid => {
    await checkVMExist(grid, "Funkwhale", name);
    return grid.machines
      .deploy(vms)
      .then(() => grid.machines.getObj(name))
      .then(([vm]) => vm);
  });
}

async function deployPrefixGateway(profile: IProfile, domainName: string, backend: string, publicNodeId: number) {
  const { GatewayNameModel } = window.configs.grid3_client;

  // Gateway Specs
  const gw = new GatewayNameModel();
  gw.name = domainName;
  gw.node_id = publicNodeId;
  gw.tls_passthrough = false;
  gw.backends = [`http://[${backend}]:80/`];
  gw.solutionProviderID = InternalSolutionProviderID;

  const metadate = {
    type: "gateway",
    name: domainName,
    projectName: "Funkwhale",
  };
  gw.metadata = JSON.stringify(metadate);

  return deploy(profile, "GatewayName", domainName, async grid => {
    await checkGW(grid, domainName, "Funkwhale");
    return grid.gateway
      .deploy_name(gw)
      .then(() => grid.gateway.getObj(domainName))
      .then(([gw]) => gw);
  });
}
