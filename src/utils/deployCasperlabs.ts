import type { default as Casperlabs } from "../types/casperlabs";

import type { IProfile } from "../types/Profile";
import deploy from "./deploy";

import { selectGatewayNode, getUniqueDomainName } from "./gatewayHelpers";
import rootFs from "./rootFs";
import createNetwork from "./createNetwork";
import { Network } from "../types/kubernetes";
import destroy from "./destroy";
import checkVMExist, { checkGW } from "./prepareDeployment";

const {
  DiskModel,
  MachineModel,
  MachinesModel,
  GatewayNameModel,
  generateString,
} = window.configs?.grid3_client ?? {};

export default async function deployCasperlabs(
  data: Casperlabs,
  profile: IProfile
) {
  // gateway model: <solution-type><twin-id><solution_name>
  let domainName = await getUniqueDomainName(profile, data.name, "casperlabs");

  // Dynamically select node to deploy the gateway
  let [publicNodeId, nodeDomain] = await selectGatewayNode();
  data.domain = `${domainName}.${nodeDomain}`;

  // deploy the casper labs
  const deploymentInfo = await deployCasperlabsVM(profile, data);

  // get the info of casperlabs deployment
  const planetaryIP = deploymentInfo["planetary"] as string;

  try {
    // deploy the gateway
    await deployPrefixGateway(profile, domainName, planetaryIP, publicNodeId);
  } catch (error) {
    // rollback casperlabs deployment if gateway deployment failed
    await destroy(profile, "casperlabs", data.name);
    throw error;
  }

  return { deploymentInfo };
}

async function deployCasperlabsVM(profile: IProfile, data: Casperlabs) {
  const {
    name,
    cpu,
    memory,
    disks: [{ size }],
    publicIp,
    nodeId,
    envs,
    domain,
  } = data;

  // sub deployments model (vm, disk, net): <type><random_suffix>
  let randomSuffix = generateString(10).toLowerCase();

  // define a network
  const network = createNetwork(new Network(`net${randomSuffix}`, "10.1.0.0/16")); // prettier-ignore

  // disk
  const disk = new DiskModel();
  disk.name = `disk${randomSuffix}`;
  disk.size = size;
  disk.mountpoint = "/var/lib/casper/casper-node";

  // vm specs
  const vm = new MachineModel();
  vm.name = name; //`vm${randomSuffix}`;
  vm.node_id = nodeId;
  vm.disks = [disk];
  vm.public_ip = true;
  vm.public_ip6 = true;
  vm.planetary = true;
  vm.cpu = cpu;
  vm.memory = memory;
  vm.rootfs_size = rootFs(cpu, memory);
  vm.flist =
    "https://hub.grid.tf/tf-official-apps/casperlabs-latest.flist";
  vm.entrypoint = "/sbin/zinit init";
  vm.env = {
    SSH_KEY: profile.sshKey,
    CASPERLABS_HOSTNAME: domain,
  };

  // vms specs
  const vms = new MachinesModel();
  vms.name = name;
  vms.network = network;
  vms.machines = [vm];

  const metadate = {
    "type":  "vm",  
    "name": name,
    "projectName": "Casperlabs"
  };
  vms.metadata = JSON.stringify(metadate);

  // deploy
  return deploy(profile, "Casperlabs", name, async (grid) => {
    await checkVMExist(grid, "casperlabs", name);
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
  // define specs
  const gw = new GatewayNameModel();
  gw.name = domainName;
  gw.node_id = publicNodeId;
  gw.tls_passthrough = false;
  gw.backends = [`http://[${backend}]:80`];

  const metadate = {
    "type":  "gateway",  
    "name": domainName,
    "projectName": "Casperlabs"
  };
  gw.metadata = JSON.stringify(metadate);

  return deploy(profile, "GatewayName", domainName, async (grid) => {
    await checkGW(grid, domainName, "casperlabs");
    return grid.gateway
      .deploy_name(gw)
      .then(() => grid.gateway.getObj(domainName))
      .then(([gw]) => gw);
  });
}
