import type { default as Kubernetes, Base } from "../types/kubernetes";
import type { IProfile } from "../types/Profile";
import createNetwork from "./createNetwork";
import deploy from "./deploy";
import { InternalSolutionProviderID } from "./solutionProvider";

export default async function deployKubernetes(data: Kubernetes, profile: IProfile) {
  const { master, workers, network, ...base } = data;
  const { secret, description, metadata, name } = base;

  const masterNodes = [createNode(master)];
  const workerNodes = workers.map(createNode);
  const _network = createNetwork(network, true);

  const k8s = new window.configs.grid3_client.K8SModel();
  k8s.name = name;
  k8s.secret = secret;
  k8s.network = _network;
  k8s.masters = masterNodes;
  k8s.workers = workerNodes;
  k8s.metadata = metadata;
  k8s.description = description;
  k8s.ssh_key = profile.sshKey;

  const metadate = {
    type: "kubernetes",
    name: name,
    projectName: "Kubernetes",
  };
  k8s.metadata = JSON.stringify(metadate);

  return deploy(profile, "Kubernetes", name, async grid => {
    await grid.k8s.deploy(k8s);
    return await grid.k8s.getObj(name);
  });
}

function createNode(data: Base) {
  const node = new window.configs.grid3_client.KubernetesNodeModel();
  node.name = data.name;
  node.node_id = data.node;
  node.cpu = data.cpu;
  node.disk_size = data.diskSize;
  node.memory = data.memory;
  node.public_ip = data.publicIp;
  node.public_ip6 = data.publicIp6;
  node.rootfs_size = data.rootFs;
  node.planetary = data.planetary;
  node.solutionProviderID = InternalSolutionProviderID;
  return node;
}
