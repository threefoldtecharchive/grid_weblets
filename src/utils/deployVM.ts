import type { default as VM, Disk, Env } from "../types/vm";
import createNetwork from "./createNetwork";
const { DiskModel, MachineModel, MachinesModel } =
  window.configs?.grid3_client ?? {};
import type { IProfile } from "../types/Profile";
import deploy from "./deploy";

export default async function deployVM(data: VM, profile: IProfile) {
  const { envs, disks, rootFs, ...base } = data;
  const { name, flist, cpu, memory, entrypoint, network: nw } = base;
  const { publicIp, planetary, nodeId, publicIp6 } = base;

  const vm = new MachineModel();
  vm.name = name;
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

  const vms = new MachinesModel();
  vms.name = name;
  vms.network = createNetwork(nw);
  vms.machines = [vm];

  return deploy(profile, "VM", name, (grid) => {
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
