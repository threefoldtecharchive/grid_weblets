import type Mattermost from "../types/mattermost";
import type { IProfile } from "../types/Profile";
import type { Disk } from "../types/vm";
import createNetwork from "./createNetwork";
import deploy from "./deploy";
const { DiskModel, MachineModel, MachinesModel } =
  window.configs?.grid3_client ?? {};

export default function deployMattermost(
  profile: IProfile,
  mattermost: Mattermost
) {
  const { network, ...config } = mattermost;
  const { name, username, dbUsername, password, nodeId, cpu, disk, memory, publicIp, planetary, rootFsSize } = config; // prettier-ignore

  const dbVm = new MachineModel();
  dbVm.name = "DB" + name.slice(0, 10);
  dbVm.node_id = nodeId;
  dbVm.disks = [];
  dbVm.public_ip = false;
  dbVm.planetary = planetary;
  dbVm.cpu = cpu;
  dbVm.memory = memory;
  dbVm.rootfs_size = rootFsSize;
  dbVm.flist = "https://hub.grid.tf/ashraf.3bot/ashraffouda-tf-mysql-latest.flist"; // prettier-ignore
  dbVm.entrypoint = "/sbin/zinit init";
  dbVm.env = {
    MYSQL_ROOT_PASSWORD: password,
    MYSQL_USER: dbUsername,
    MYSQL_PASSWORD: password,
    MYSQL_DATABASE: "mattermost",
  };

  const mMVm = new MachineModel();
  mMVm.name = name;
  mMVm.node_id = nodeId;
  mMVm.disks = [createDisk(disk)];
  mMVm.public_ip = publicIp;
  mMVm.planetary = planetary;
  mMVm.cpu = cpu;
  mMVm.memory = memory;
  mMVm.rootfs_size = rootFsSize;
  mMVm.flist = "https://hub.grid.tf/ashraf.3bot/ashraffouda-tf-mattermost-latest.flist"; // prettier-ignore
  mMVm.entrypoint = "/sbin/zinit init";
  mMVm.env = {
    DB_PORT_NUMBER: "3306",
    MM_SQLSETTINGS_DRIVERNAME: "mysql",
    MM_USERNAME: username,
    MM_PASSWORD: password,
    MM_DBNAME: "mattermost",
    SSH_KEY: profile.sshKey,
  };

  const vms = new MachinesModel();
  vms.name = name;
  vms.network = createNetwork(network);
  vms.machines = [mMVm, dbVm];

  return deploy(profile, "VM", name, (grid) => {
    return grid.machines.deploy(vms).then((res) => {
      console.log({ res });
      return res;
    });
  });
}

function createDisk({ name, size, mountpoint }: Disk) {
  const disk = new DiskModel();
  disk.name = name;
  disk.size = size;
  disk.mountpoint = mountpoint;
  return disk;
}
