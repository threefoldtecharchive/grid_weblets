import { Network } from "../types/kubernetes";
import type Mattermost from "../types/mattermost";
import type { IProfile } from "../types/Profile";
import createNetwork from "./createNetwork";
import deploy from "./deploy";
import rootFs from "./rootFs";
const { MachineModel, MachinesModel } = window.configs?.grid3_client ?? {};

export default function deployMattermost(
  profile: IProfile,
  mattermost: Mattermost
) {
  const { name, username, password, server, domain, port, nodeId } = mattermost;

  const vm = new MachineModel();
  vm.name = name;
  vm.node_id = nodeId;
  vm.disks = [];
  vm.public_ip = true;
  vm.planetary = true;
  vm.cpu = 2;
  vm.memory = 2048;
  vm.rootfs_size = rootFs(2, 2048);
  vm.flist = "https://hub.grid.tf/ashraf.3bot/ashraffouda-mattermost-latest.flist"; // prettier-ignore
  vm.entrypoint = "/entrypoint.sh";
  vm.env = {
    DB_PASSWORD: password,
    SITE_URL: domain,
    SMTPUsername: username,
    SMTPPassword: password,
    SMTPServer: server,
    SMTPPort: port,
    SSH_KEY: profile.sshKey,
  };

  const vms = new MachinesModel();
  vms.name = name;
  vms.network = createNetwork(new Network());
  vms.machines = [vm];

  return deploy(profile, "VM", name, (grid) => {
    return grid.machines.deploy(vms).then((res) => {
      console.log({ res });
      return res;
    });
  });
}
