import type { IProfile } from "../types/Profile";
import type { GridClient } from "grid3_client";

export default async function getGrid<T>(
  profile: IProfile,
  cb: (grid: GridClient) => T,
  disconnect = true,
  solutionType?: string,
): Promise<T> {
  const { networkEnv, mnemonics } = profile;
  const grid = new window.configs.grid3_client.GridClient(
    networkEnv as any,
    mnemonics,
    profile.storeSecret || mnemonics,
    new window.configs.client.HTTPMessageBusClient(0, "", "", ""),
    undefined,
    window.configs.grid3_client.BackendStorageType.tfkvstore,
  );

  await grid.connect();
  return cb(grid);
}
