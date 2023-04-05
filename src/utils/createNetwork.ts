import { GridClient } from "grid3_client";
import type { Network } from "../types/kubernetes";
import { get } from "svelte/store";

async function getClient(): Promise<GridClient> {
  const profile = get(window.configs.baseConfig);
  if (!profile) return;

  const gridClient = new GridClient({
    network: profile.networkEnv,
    mnemonic: profile.mnemonics,
    storeSecret: profile.mnemonics,
  });
  await gridClient.connect();
  return gridClient;
}

export default async function createNetwork(nw: Network) {
  const network = new window.configs.grid3_client.NetworkModel();
  network.name = nw.name;
  network.ip_range = nw.ipRange;
  network.addAccess = nw.addAccess;

  if (network?.addAccess && network?.name) {
    const grid3 = await getClient();

    await grid3.networks.getWireGuardConfigs({ name: network.name });
  }

  return network;
}
