import type { default as VM, Disk, Env } from "../types/vm";
import createNetwork from "./createNetwork";
const { HTTPMessageBusClient } = window.configs?.client ?? {};
const { DiskModel, MachineModel, MachinesModel, GridClient, GatewayNameModel } =
  window.configs?.grid3_client ?? {};
import type { IProfile } from "../types/Profile";
import { get } from "svelte/store";

export default async function deployFunkwhale(data: VM, profile: IProfile) {
  const { envs, disks, ...base } = data;
  const { name, flist, cpu, memory, entrypoint, network: nw } = base;
  const { publicIp, planetary, nodeId, rootFsSize } = base;
  const { mnemonics, storeSecret, networkEnv } = profile;

  const http = new HTTPMessageBusClient(0, "");
  const grid = new GridClient(
    networkEnv as any,
    mnemonics,
    storeSecret,
    http,
    undefined,
    "tfkvstore" as any
  );

  const vm = new MachineModel();
  vm.name = name;
  vm.node_id = nodeId;
  vm.disks = disks.map(createDisk);
  vm.public_ip = publicIp;
  vm.planetary = planetary;
  vm.cpu = cpu;
  vm.memory = memory;
  vm.rootfs_size = rootFsSize;
  vm.flist = "https://hub.grid.tf/omar0.3bot/omarelawady-funk-latest.flist";
  vm.entrypoint = "/init.sh";
  vm.env = {
      FUNKWHALE_HOSTNAME: name + ".gent01.dev.grid.tf",
  }
  const vms = new MachinesModel();
  vms.name = name;
  vms.network = createNetwork(nw);
  vms.machines = [vm];

  await grid.connect();

  await grid.machines.deploy(vms);
    
    const info = await getFunkwhaleInfo(grid, name);
    const funkYggIp = info[0]["yggIP"];

    await deployPrefixGateway(grid, name, funkYggIp);
    
    const gatewayInfo = await getGatewayInfo(grid, name);
    const gatewayDomain = gatewayInfo[0]["domain"];
    
    console.log(gatewayDomain);
}

function createDisk({ name, size, mountpoint }: Disk) {
  const disk = new DiskModel();
  disk.name = name;
  disk.size = size;
  disk.mountpoint = mountpoint;
  return disk;
}


async function deployPrefixGateway(client: any, name: string, backend: string) {
    // define specs
    const gw = new GatewayNameModel();
    gw.name = name;
    gw.node_id = 8;
    gw.tls_passthrough = false;
    gw.backends = [`http://[${backend}]:80/`];
  
    // deploy
    return client.gateway.deploy_name(gw);
}

async function getGatewayInfo(client: any, name: string) {
    const info = await client.gateway.getObj(name);
    return info;
}

async function getFunkwhaleInfo(client: any, name: string) {
    const info = await client.machines.getObj(name);
    return info;
  }