import type { default as CloudInit } from "../types/cloudInit";
import createNetwork from "./createNetwork";
const { DiskModel, MachineModel, MachinesModel, generateString } =
  window.configs?.grid3_client ?? {};
import type { IProfile } from "../types/Profile";
import deploy from "./deploy";
import checkVMExist from "./prepareDeployment";
import { Network } from "../types/kubernetes";
import rootFs from "./rootFs";


export default async function deployCloudInit(data: CloudInit, profile: IProfile) {
  const { disks: [{ size }], envs, ...base } = data;
  const { name, flist, cpu, memory, network: nw } = base;
  const { publicIp6, planetary, nodeId } = base;

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
  vm.name = name; //`vm${randomSuffix}`;
  vm.node_id = nodeId;
  vm.disks = [disk];
  vm.public_ip = publicIp6;
  vm.planetary = planetary;
  vm.cpu = cpu;
  vm.memory = memory;
  vm.rootfs_size = rootFs(cpu, memory);
  vm.flist = flist;
  vm.entrypoint = "/sbin/zinit init";
  vm.env = {
    SSH_KEY: profile.sshKey,
  };

  // VMS Specs
  const vms = new MachinesModel();
  vms.name = name;
  vms.network = network;
  vms.machines = [vm];

  const metadate = {
    "type": "vm",
    "name": name,
    "projectName": "cloudInit"
  };
  vms.metadata = JSON.stringify(metadate);


  return deploy(profile, "CloudInit", name, async (grid) => {
    await checkVMExist(grid, "cloudInit", name);
    return grid.machines
      .deploy(vms)
      .then(() => grid.machines.getObj(name))
      .then(([vm]) => vm);
  });


}

