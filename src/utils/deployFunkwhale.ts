import type { default as Funkwhale } from "../types/funkwhale";
import type { IProfile } from "../types/Profile";
import { Network } from "../types/kubernetes";

import { selectGatewayNode, getUniqueDomainName } from "./gatewayHelpers";
import createNetwork from "./createNetwork";
import deploy from "./deploy";
import rootFs from "./rootFs";
import destroy from "./destroy";
import checkVMExist from "./checkVM";

const {
  DiskModel,
  MachineModel,
  MachinesModel,
  GatewayNameModel,
  generateString,
} = window.configs?.grid3_client ?? {};

export default async function deployFunkwhale(
  data: Funkwhale,
  profile: IProfile
) {
  // gateway model: <solution-type><twin-id><solution_name>
  let domainName = await getUniqueDomainName(
    profile,
    data.name,
    "Funkwhale",
    "fw"
  );

  // Dynamically select node to deploy the gateway
  let [publicNodeId, nodeDomain] = await selectGatewayNode();
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
    envs,
    domain,
  } = data;

  // sub deployments model (vm, disk, net): <type><random_suffix>
  let randomSuffix = generateString(10).toLowerCase();

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
  vm.name = `vm${randomSuffix}`;
  vm.node_id = nodeId;
  vm.disks = [disk];
  vm.public_ip = publicIp;
  vm.planetary = true;
  vm.cpu = cpu;
  vm.memory = memory;
  vm.rootfs_size = rootFs(cpu, memory);
  vm.flist =
    "https://hub.grid.tf/asamirr.3bot/asamirr-tf-funkwhale-dec21.flist";
  vm.entrypoint = "/init.sh";
  vm.env = {
    FUNKWHALE_HOSTNAME: domain,
    DJANGO_SUPERUSER_EMAIL: adminEmail,
    DJANGO_SUPERUSER_USERNAME: adminUsername,
    DJANGO_SUPERUSER_PASSWORD: adminPassword,
  };

  // VMS Specs
  const vms = new MachinesModel();
  vms.name = name;
  vms.network = network;
  vms.machines = [vm];

  return deploy(profile, "Funkwhale", name, async (grid) => {
    await checkVMExist(grid, "funkwhale", name);
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
  // Gateway Specs
  const gw = new GatewayNameModel();
  gw.name = domainName;
  gw.node_id = publicNodeId;
  gw.tls_passthrough = false;
  gw.backends = [`http://[${backend}]:80/`];

  return deploy(profile, "GatewayName", domainName, async (grid) => {
    // For invalidating the cashed keys in the KV store, getObj check if the key has no deployments. it is deleted.
    await grid.gateway.getObj(domainName);
    return grid.gateway
      .deploy_name(gw)
      .then(() => grid.gateway.getObj(domainName))
      .then(([gw]) => gw);
  });
}
