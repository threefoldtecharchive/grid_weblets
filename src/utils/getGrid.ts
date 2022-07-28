import type { IProfile } from "../types/Profile";
import type { GridClient } from "grid3_client";

export default async function getGrid<T>(
  profile: IProfile,
  cb: (grid: GridClient) => T,
  disconnect: boolean = true,
  solutionType?: string
): Promise<T> {
  const { networkEnv, mnemonics, storeSecret } = profile;
  const grid = new window.configs.grid3_client.GridClient(
    networkEnv as any,
    mnemonics,
    storeSecret,
    new window.configs.client.HTTPMessageBusClient(0, "", "", ""),
    undefined,
    window.configs.grid3_client.BackendStorageType.tfkvstore
  );

  try {
    await grid.connect();
  } catch {}

  return cb(grid);
}
