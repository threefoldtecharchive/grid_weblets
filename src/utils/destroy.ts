import type { IProfile } from "../types/Profile";

export default function destroy(profile: IProfile, type: string, name: string) {
  const { networkEnv, mnemonics, storeSecret } = profile;
  const client = new window.configs.grid3_client.GridClient(
    networkEnv as any,
    mnemonics,
    mnemonics,
    type,
    window.configs.grid3_client.BackendStorageType.tfkvstore,
  );
  return client.machines.delete({ name });
}
