import { Network } from "../types/kubernetes";
const { NetworkModel } = window.configs?.grid3_client ?? {};

export default function createNetwork(nw: Network, access: boolean = false) {
  nw = new Network();
  const network = new NetworkModel();
  network.name = nw.name;
  network.ip_range = nw.ipRange;
  network.addAccess = access;
  return network;
}
