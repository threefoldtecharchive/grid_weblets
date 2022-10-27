import type { ActiveProfile } from "../stores/activeProfile";

export default function destroy(profile: ActiveProfile, type: string, name: string) {
  const { network, mnemonics, secret } = profile;
  const client = new window.configs.grid3_client.GridClient(
    network,
    mnemonics,
    secret,
    new window.configs.client.HTTPMessageBusClient(0, "", "", ""),
    type,
    window.configs.grid3_client.BackendStorageType.tfkvstore
  );
  return client.machines.delete({ name });
}
