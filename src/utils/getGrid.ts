import type { IProfile } from "../types/Profile";
import type { GridClient } from "grid3_client";
import type { IStore } from "../types/istore";

export default async function getGrid<T>(
  profile: IProfile,
  cb: (grid: GridClient) => T,
  solutionType: IStore["type"] | "",
): Promise<T> {
  const { mnemonics } = profile;
  const grid = new window.configs.grid3_client.GridClient({
    mnemonic: mnemonics,
    backendStorageType: window.configs.grid3_client.BackendStorageType.tfkvstore,
    projectName: solutionType,

    network: window.env.NETWORK,
    substrateURL: window.env.SUBSTRATE_URL,
    proxyURL: window.env.GRIDPROXY_URL,
    graphqlURL: window.env.GRAPHQL_URL,
    activationURL: window.env.ACTIVATION_SERVICE_URL,
    relayURL: window.env.RELAY_DOMAIN,
  });

  await grid.connect();
  return cb(grid);
}
