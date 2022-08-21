import type { default as Kubernetes, Base } from "../types/kubernetes";
import { Network } from "../types/kubernetes";
import type { IProfile } from "../types/Profile";
import createNetwork from "./createNetwork";
import deploy from "./deploy";
const { K8SModel, KubernetesNodeModel } = window.configs?.grid3_client ?? {};

export default async function deployKubernetes(
  data: Kubernetes,
  profile: IProfile
) {
  const { master, workers, network: nw, ...base } = data;
  const { secret, description, metadata, name } = base;

  const masterNodes = [createNode(master)];
  const workerNodes = workers.map(createNode);

  const k8s = new K8SModel();
  k8s.name = name;
  k8s.secret = secret;
  k8s.network = createNetwork(new Network(), true);
  k8s.masters = masterNodes;
  k8s.workers = workerNodes;
  k8s.metadata = metadata;
  k8s.description = description;
  k8s.ssh_key = profile.sshKey;

  const metadate = {
    "type":  "kubernetes",  
    "name": name,
    "projectName": "Kubernetes"
  };
  k8s.metadata = JSON.stringify(metadate);

  return deploy(profile, "Kubernetes", name, (grid) => {
    return grid.k8s.deploy(k8s).then(() => grid.k8s.getObj(name));
  });
}

function createNode(data: Base) {
  const node = new KubernetesNodeModel();
  node.name = data.name;
  node.node_id = data.node;
  node.cpu = data.cpu;
  node.disk_size = data.diskSize;
  node.memory = data.memory;
  node.public_ip = data.publicIp;
  node.public_ip6 = data.publicIp6;
  node.rootfs_size = data.rootFs;
  node.planetary = data.planetary;
  return node;
}
