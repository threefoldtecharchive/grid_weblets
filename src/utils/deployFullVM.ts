import type { default as FullVM } from "../types/fullVM";
import type { Disk, Env } from "../types/vm"
import createNetwork from "./createNetwork";
const { DiskModel, MachineModel, MachinesModel } =
  window.configs?.grid3_client ?? {};
import type { IProfile } from "../types/Profile";
import deploy from "./deploy";
import checkVMExist from "./prepareDeployment";
import { Network } from "../types/kubernetes";

export default async function deployFullVM(data: FullVM, profile: IProfile) {
  const { disks, envs, rootFs, ...base } = data;
  const { name, flist, cpu, memory, entrypoint, network: nw } = base;
  const { publicIp, publicIp6, planetary, nodeId } = base;

  // VM Specs
  const vm = new MachineModel();
  vm.name = name; //`vm${randomSuffix}`;
  vm.node_id = nodeId;
  vm.disks = disks.map(createDisk);
  vm.public_ip = publicIp;
  vm.public_ip6 = publicIp6;
  vm.planetary = planetary;
  vm.cpu = cpu;
  vm.memory = memory;
  vm.rootfs_size = rootFs;
  vm.flist = flist;
  vm.entrypoint = entrypoint;
  vm.env = createEnvs(envs);



  // VMS Specs
  const vms = new MachinesModel();
  vms.name = name;
  vms.network = createNetwork(new Network());
  vms.machines = [vm];

  const metadate = {
    "type": "vm",
    "name": name,
    "projectName": "VM"
  };
  vms.metadata = JSON.stringify(metadate);


  return deploy(profile, "VM", name, async (grid) => {
    await checkVMExist(grid, "vm", name);
    return grid.machines
      .deploy(vms)
      .then(() => grid.machines.getObj(name))
      .then(([vm]) => vm);
  });
}

function createDisk({ name, size, mountpoint }: Disk) {
  const disk = new DiskModel();
  disk.name = name;
  disk.size = size;
  disk.mountpoint = mountpoint;
  return disk;
}

function createEnvs(envs: Env[]): { [key: string]: string } {
  return envs.reduce((res, env) => {
    res[env.key] = env.value;
    return res;
  }, {});
}

