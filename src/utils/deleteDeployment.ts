import { getUniqueDomainName } from "./gatewayHelpers";

interface IConfig {
  mnemonics: string;
  storeSecret: string;
  networkEnv: string;
}

export default async function deleteDeployment(configs: IConfig, key: "k8s" | "machines", name: string, type: string) {
  const { GridClient } = window.configs.grid3_client;
  const { HTTPMessageBusClient } = window.configs.client;

  const { mnemonics, networkEnv, storeSecret } = configs;
  const http = new HTTPMessageBusClient(0, "", "", "");
  const grid = new GridClient(networkEnv as any, mnemonics, storeSecret, http, type, "tfkvstore" as any);

  // remove deployment in namespace `type`
  console.log({ grid });
  await grid.connect();
  const obj = await _deleteDeployments(grid, name, configs, type, key);

  console.log({ obj });
  if (obj["deleted"].length) {
    return obj;
  }

  // remove deployments (vm, gw) in default namespace ``
  grid.projectName = "";
  await grid._connect();
  console.log({ grid });
  return await _deleteDeployments(grid, name, configs, "", key);
}

async function _deleteDeployments(grid, name, configs, type, key) {
  const domainName = await getUniqueDomainName(configs, name, type);
  if (type === "qvm") {
    const qvm = await grid.machines.getObj(name);
    await grid.qsfs_zdbs.delete({ name: qvm[0].mounts[0].name });
  }
  await grid.gateway.delete_name({ name: domainName });
  return await grid[key].delete({ name });
}
