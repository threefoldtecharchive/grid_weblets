import type { ActiveProfile } from "../stores/activeProfile";

export default function validateMnemonics(profile: ActiveProfile) {
  const { network, mnemonics, secret } = profile;
  const http = new window.configs.client.HTTPMessageBusClient(0, "", "", "");
  const grid = new window.configs.grid3_client.GridClient(
    network,
    mnemonics,
    secret,
    http,
    undefined,
    "tfkvstore" as any
  );
  return grid
    .connect()
    .then(() => grid.disconnect())
    .then(() => true)
    .catch(() => false);
}

export function syncValidateMnemonics(mnemonics: string): string | void {
  if (mnemonics === "") return "Mnemonics is required";
  if (!window.configs.bip39.validateMnemonic(mnemonics)) {
    return "Invalid Mnemonics.";
  }
}
