import type { GridClient } from "grid3_client";
import type { IStore } from "./../stores/currentDeployment";
import { getUniqueDomainName } from "./gatewayHelpers";

interface IConfig {
  mnemonics: string;
  storeSecret: string;
  networkEnv: string;
}

const solutionWithGW: IStore["type"][] = [
  "Discourse",
  "Funkwhale",
  "Mastodon",
  "Mattermost",
  "Owncloud",
  "Peertube",
  "Subsquid",
  "Taiga",
  "Wordpress",
];

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
  const hasGw = solutionWithGW.includes(type);
  let defaultNameSpace = false;

  // remove deployment in namespace `type`
  await grid.connect();
  const obj = await _deleteDeployments(grid, name, configs, type, key, defaultNameSpace, hasGw);

  if (obj.length) {
    return obj;
  }

  // remove deployments (vm, gw) in default namespace ``
  defaultNameSpace = true;
  return await _deleteDeployments(grid, name, configs, type, key, defaultNameSpace, hasGw);
}

async function _deleteDeployments(grid, name, configs, type, key, defaultNameSpace = false, hasGw) {
  const domainName = await getUniqueDomainName(configs, name, type);

  if (defaultNameSpace) {
    grid.clientOptions.projectName = "";
    await grid._connect();
  }

  if (type === "Qvm") {
    const qvm = await grid.machines.getObj(name);
    await grid.qsfs_zdbs.delete({ name: qvm[0].mounts[0].name });
  }

  const deleted = await grid[key].delete({ name });
  if (!hasGw || defaultNameSpace) return deleted;

  const deletedgw = await _deleteDeploymentsGw(grid, domainName);
  if (!deletedgw) throw new Error("Can't delete gateway contracts with name " + domainName);

  return deleted;
}

async function _deleteDeploymentsGw(grid: GridClient, domainName: string) {
  let deleted = await deleteGw(grid, grid.clientOptions.projectName, domainName);
  if (deleted) return deleted;

  deleted = await deleteGw(grid, "GatewayName", domainName);
  if (deleted) return deleted;

  deleted = await deleteGw(grid, "", domainName);
  if (deleted) return deleted;

  return null;
}

async function deleteGw(grid: GridClient, namespace: string, domainName: string) {
  grid.clientOptions.projectName = namespace;
  await grid._connect();
  const { deleted } = await grid.gateway.delete_name({ name: domainName });
  if (deleted.length) return deleted;
  else return null;
}
