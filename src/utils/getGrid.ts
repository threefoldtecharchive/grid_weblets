import type { IProfile } from "../types/Profile";
import type { GridClient, NetworkEnv } from "grid3_client";

export default async function getGrid<T>(profile: IProfile, cb: (grid: GridClient) => T): Promise<T> {
  const { networkEnv, mnemonics } = profile;
  const grid = new window.configs.grid3_client.GridClient(
    networkEnv as unknown as NetworkEnv,
    mnemonics,
    profile.storeSecret || mnemonics,
    new window.configs.client.HTTPMessageBusClient(0, "", "", ""),
    undefined,
    window.configs.grid3_client.BackendStorageType.tfkvstore,
  );

  try {
    await grid.connect();
  } catch {
    //
  }

  return cb(grid);
}
