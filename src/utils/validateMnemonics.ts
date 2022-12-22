import type { BackendStorageType, NetworkEnv } from "grid3_client";
import type { IProfile } from "../types/Profile";

export default function validateMnemonics(profile: IProfile) {
  const { networkEnv, mnemonics, storeSecret } = profile;
  const http = new window.configs.client.HTTPMessageBusClient(0, "", "", "");
  const grid = new window.configs.grid3_client.GridClient(
    networkEnv as unknown as NetworkEnv,
    mnemonics,
    storeSecret,
    http,
    undefined,
    "tfkvstore" as BackendStorageType,
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
