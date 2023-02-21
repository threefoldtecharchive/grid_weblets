import type { IProfile } from "../types/Profile";

export default function destroy(profile: IProfile, type: string, name: string) {
  const { mnemonics } = profile;
  const client = new window.configs.grid3_client.GridClient({
    mnemonic: mnemonics,
    backendStorageType: window.configs.grid3_client.BackendStorageType.tfkvstore,
    projectName: type,

    network: window.env.NETWORK,
    substrateURL: window.env.SUBSTRATE_URL,
    proxyURL: window.env.GRIDPROXY_URL,
    graphqlURL: window.env.GRAPHQL_URL,
    activationURL: window.env.ACTIVATION_SERVICE_URL,
    relayURL: window.env.RELAY_DOMAIN,
  });
  return client.machines.delete({ name });
}
