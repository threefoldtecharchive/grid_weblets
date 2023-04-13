import type { Network } from "../types/kubernetes";

export default function createNetwork(nw: Network, addAccess = false) {
  const network = new window.configs.grid3_client.NetworkModel();
  network.name = nw.name;
  network.ip_range = nw.ipRange;
  network.addAccess = addAccess;

  return network;
}
