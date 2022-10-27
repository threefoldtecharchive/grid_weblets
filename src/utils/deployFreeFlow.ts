import type { Env as Env } from "../types/vm";
import createNetwork from "./createNetwork";
import type { IProfile } from "../types/Profile";
import deploy from "./deploy";
import checkVMExist, { checkGW } from "./prepareDeployment";
import { Network } from "../types/kubernetes";
import type FreeFlow from "../types/freeflow";
import destroy from "./destroy";
import { GatewayNodes, selectSpecificGatewayNode } from "./gatewayHelpers";

const { MachineModel, MachinesModel } = window.configs?.grid3_client ?? {};

export default async function deployFreeFlow(
  data: FreeFlow,
  profile: IProfile,
  gateway: GatewayNodes
) {
  const deploymentInfo = await deployFreeFlowVm(profile, data);
  const domainName = data.threeBotUserId;

  let [publicNodeId, nodeDomain] = selectSpecificGatewayNode(gateway);
  data.domain = `${domainName}.${nodeDomain}`;

  const yggdrasilIp = <string>deploymentInfo["planetary"];

  try {
    await deployPrefixGateway(profile, domainName, yggdrasilIp, publicNodeId);
  } catch (error) {
    await destroy(profile, "freeflow", data.vmName);
    throw error;
  }

  return { deploymentInfo };
}

async function deployFreeFlowVm(profile: IProfile, data: FreeFlow) {
  const { envs, disks, ...base } = data;
  const { vmName, flist, cpu, memory, entrypoint, network, rootFs } = base;
  const { publicIp, planetary, nodeId } = base;

  const vm = new MachineModel();
  vm.name = vmName;
  vm.node_id = nodeId;
  vm.disks = disks;
  vm.memory = memory;
  vm.rootfs_size = rootFs;
  vm.flist = flist;
  vm.entrypoint = entrypoint;
  vm.cpu = cpu;
  vm.planetary = planetary;
  vm.public_ip = publicIp;

  vm.env = createEnvs(envs);

  const vms = new MachinesModel();
  vms.name = vmName;
  vms.network = createNetwork(new Network(network.name, network.ipRange));
  vms.machines = [vm];

  const meta = {
    type: "vm",
    name: vmName,
    projectName: "freeflow",
  };

  vms.metadata = JSON.stringify(meta);

  // deploy
  return deploy(profile, "freeflow", vmName, async (grid) => {
    await checkVMExist(grid, "freeflow", vmName);
    return grid.machines
      .deploy(vms)
      .then(() => grid.machines.getObj(vmName))
      .then(([vm]) => vm);
  });
}

async function deployPrefixGateway(
  profile: IProfile,
  domainName: string,
  backendPlanetaryIp: string,
  publicNodeId: number
) {
  const { GatewayNameModel } = window.configs.grid3_client;

  // Gateway Specs
  const gw = new GatewayNameModel();
  gw.name = domainName;
  gw.node_id = publicNodeId;
  gw.tls_passthrough = false;
  gw.backends = [`http://[${backendPlanetaryIp}]`];

  const metadata = {
    type: "gateway",
    name: domainName,
    projectName: "freeflow",
  };
  gw.metadata = JSON.stringify(metadata);

  return deploy(profile, "GatewayName", domainName, async (grid) => {
    await checkGW(grid, domainName, "freeflow");
    return grid.gateway
      .deploy_name(gw)
      .then(() => grid.gateway.getObj(domainName))
      .then(([gw]) => gw);
  });
}

const createEnvs = (envs: Env[]): { [key: string]: string } => {
  return envs.reduce((res, env) => {
    res[env.key] = env.value;
    return res;
  }, {});
};
