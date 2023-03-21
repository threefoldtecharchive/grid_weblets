import type { IStore } from "./../stores/currentDeployment";
import { getUniqueDomainName } from "./gatewayHelpers";

interface IConfig {
  mnemonics: string;
  storeSecret: string;
  networkEnv: string;
}

export default async function deleteDeployment(
  configs: IConfig,
  key: "k8s" | "machines",
  name: string,
  type: IStore["type"],
) {
  const { mnemonics } = configs;
  const grid = new window.configs.grid3_client.GridClient({
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

  // remove deployment in namespace `type`
  console.log({ grid });
  await grid.connect();
  const obj = await _deleteDeployments(grid, name, configs, type, key);

  console.log({ obj });
  if (obj["deleted"].length) {
    return obj;
  }

  // remove deployments (vm, gw) in default namespace ``
  grid.clientOptions.projectName = "";
  await grid._connect();
  console.log({ grid });
  return await _deleteDeployments(grid, name, configs, "", key);
}

async function _deleteDeployments(grid, name, configs, type, key) {
  const domainName = await getUniqueDomainName(configs, name, type);
  if (type === "Qvm") {
    const qvm = await grid.machines.getObj(name);
    await grid.qsfs_zdbs.delete({ name: qvm[0].mounts[0].name });
  }
  await grid.gateway.delete_name({ name: domainName });
  return await grid[key].delete({ name });
}
