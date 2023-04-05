import type { default as VM, Disk, Env } from "../types/vm";

import type { IProfile } from "../types/Profile";
import deploy from "./deploy";
import type { IStore } from "../stores/currentDeployment";
import checkVMExist from "./prepareDeployment";
import { InternalSolutionProviderID } from "./solutionProvider";

export default async function deployVM(data: VM, profile: IProfile, type: IStore["type"]) {
  const { MachineModel, MachinesModel, QSFSDiskModel } = window.configs.grid3_client;
  const { envs, disks, rootFs, qsfsDisk, ...base } = data;
  const { name, flist, cpu, memory, entrypoint } = base;
  const { publicIp, planetary, nodeId, publicIp6 } = base;
  const qsfs = new QSFSDiskModel();

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
  vm.env = type == "VM" ? createEnvs(envs) : { SSH_KEY: profile.sshKey };
  vm.solutionProviderID = InternalSolutionProviderID;

  /*QSFS*/
  if (qsfsDisk) {
    qsfs.name = qsfsDisk.name;
    qsfs.cache = qsfsDisk.cache;
    qsfs.mountpoint = qsfsDisk.mountpoint;
    qsfs.encryption_key = qsfsDisk.name;
    qsfs.prefix = qsfsDisk.name;
    qsfs.qsfs_zdbs_name = qsfsDisk.name;
    //add qsfs to vm
    vm.qsfs_disks = [qsfs];
  }

  const vms = new MachinesModel();
  vms.name = name;
  vms.network = { name: data.network.name, ip_range: data.network.ipRange, addAccess: data.network.addAccess };
  vms.machines = [vm];
  const metadate = {
    type: type == "VM" ? "vm" : type,
    name: name,
    projectName: type == "VM" ? "" : type,
  };
  vms.metadata = JSON.stringify(metadate);

  return deploy(profile, type, name, async grid => {
    if (type != "VM") await checkVMExist(grid, type, name);
    return grid.machines
      .deploy(vms)
      .then(() => grid.machines.getObj(name))
      .then(([vm]) => vm);
  });
}

function createDisk({ name, size, mountpoint }: Disk) {
  const { DiskModel } = window.configs.grid3_client;
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
