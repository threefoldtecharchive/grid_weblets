import type { GridClient, NetworkEnv } from 'grid3_client';
import type { Profile } from 'tf-profile-manager';

export default async function getGrid<T>(
  profile: Profile,
  cb: (grid: GridClient) => T
): Promise<T> {
  const { network, mnemonics, secret } = profile;
  const grid = new window.configs.grid3_client.GridClient(
    network as NetworkEnv,
    mnemonics,
    secret,
    new window.configs.client.HTTPMessageBusClient(0, '', '', ''),
    undefined,
    window.configs.grid3_client.BackendStorageType.tfkvstore
  );

  try {
    await grid.connect();
  } catch {}

  return cb(grid);
}
