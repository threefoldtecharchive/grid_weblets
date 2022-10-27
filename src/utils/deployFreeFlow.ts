import type { default as VM, Env as Env } from "../types/vm";
import createNetwork from "./createNetwork";
import type { IProfile } from "../types/Profile";
import deploy from "./deploy";
import type { IStore } from "../stores/currentDeployment";
import checkVMExist, { checkGW } from "./prepareDeployment";
import { Network } from "../types/kubernetes";
import type FreeFlow from "../types/freeflow";

const { MachineModel, MachinesModel, GatewayNameModel } =
  window.configs?.grid3_client ?? {};

export default async function deployFreeFlow(
  data: FreeFlow,
  profile: IProfile,
  type: IStore["type"]
) {
  const { envs, disks, ...base } = data;
  const {
    vmName,
    threeBotUserId,
    flist,
    cpu,
    memory,
    entrypoint,
    network,
    rootFs,
  } = base;
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
    projectName: type == "VM" ? "" : type,
  };

  vms.metadata = JSON.stringify(meta);

  return deploy(profile, type, vmName, async (grid) => {
    if (type != "VM")
      await checkVMExist(grid, type.toLocaleLowerCase(), vmName);
    return grid.machines
      .deploy(vms)
      .then(() => grid.machines.getObj(vmName))
      .then(async ([vm]) => {
        const planetary = vm.planetary.toString();
        const nodeId = parseInt(vm.nodeId.toString());

        await deployPrefixGateway(profile, threeBotUserId, planetary, nodeId);

        return vm;
      });
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
    projectName: "FreeFlow",
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
