import type { IProfile } from "../types/Profile";
const { HTTPMessageBusClient } = window.configs?.client ?? {};
const grid3 = window.configs?.grid3_client;
import type { GridClient } from "grid3_client";

export default function getGrid<T>(
  profile: IProfile,
  cb: (grid: GridClient) => T,
  disconnect: boolean = true
): Promise<T> {
  const { networkEnv, mnemonics, storeSecret } = profile;
  const grid = new grid3.GridClient(
    networkEnv as any,
    mnemonics,
    storeSecret,
    new HTTPMessageBusClient(0, ""),
    undefined,
    grid3.BackendStorageType.tfkvstore
  );

  return grid
    .connect()
    .then(() => {
      return cb(grid);
    })
    .finally(() => {
      if (disconnect) {
        grid.disconnect();
      }
    });
}
