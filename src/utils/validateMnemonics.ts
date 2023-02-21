import type { IProfile } from "../types/Profile";

export default function validateMnemonics(profile: IProfile) {
  const { mnemonics } = profile;
  const grid = new window.configs.grid3_client.GridClient({
    mnemonic: mnemonics,
    backendStorageType: window.configs.grid3_client.BackendStorageType.tfkvstore,

    network: window.env.NETWORK,
    substrateURL: window.env.SUBSTRATE_URL,
    proxyURL: window.env.GRIDPROXY_URL,
    graphqlURL: window.env.GRAPHQL_URL,
    activationURL: window.env.ACTIVATION_SERVICE_URL,
    relayURL: window.env.RELAY_DOMAIN,
  });
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
