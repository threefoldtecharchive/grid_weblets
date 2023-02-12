import type { BackendStorageType, NetworkEnv } from "grid3_client";
import type { IProfile } from "../types/Profile";

export default function validateMnemonics(profile: IProfile) {
  const { networkEnv, mnemonics } = profile;
  const grid = new window.configs.grid3_client.GridClient(
    networkEnv as unknown as NetworkEnv,
    mnemonics,
    mnemonics,
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
