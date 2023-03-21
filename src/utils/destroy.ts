import type { IStore } from "./../stores/currentDeployment";
import type { IProfile } from "../types/Profile";

export default async function destroy(profile: IProfile, type: IStore["type"], name: string) {
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
  window.configs.currentDeploymentStore.deploy("Deleting Deployment", name);
  await client.connect();
  return client.machines.delete({ name }).finally(() => {
    window.configs.currentDeploymentStore.clear();
  });
}
