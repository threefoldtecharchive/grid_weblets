import type { NetworkGetModel } from "grid3_client";
import { get } from "svelte/store";
import getGrid from "./getGrid";
import type { IProfile } from "../types/Profile";

export default async function getWireguardConfig(network: NetworkGetModel) {
  try {
    const profile = get(window.configs.baseConfig);
    if (!profile) return;
    const client = await getGrid(profile as unknown as IProfile, c => c, "");

    console.log("grid3", client);

    const networks = await client?.networks.list();
    console.log(networks);

    const wireguard = await client.networks.getWireGuardConfigs({ name: network.name });

    console.log("wireguard", wireguard);
    return wireguard;
  } catch (error) {
    console.log("error", error);
  }
}
