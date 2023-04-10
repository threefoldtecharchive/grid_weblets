import type { Network } from "../types/kubernetes";

export default function createNetwork(nw: Network) {
  const network = new window.configs.grid3_client.NetworkModel();
  network.name = nw.name;
  network.ip_range = nw.ipRange;
  network.addAccess = nw.addAccess;

  return network;
}
