import type { ActiveProfile } from "../stores/activeProfile";
import { getUniqueDomainName } from "./gatewayHelpers";


export default async function deleteDeployment(
  configs: ActiveProfile,
  key: "k8s" | "machines",
  name: string,
  type: string
  ) {
  const { GridClient } = window.configs.grid3_client;
  const { HTTPMessageBusClient } = window.configs.client;
  
  const { mnemonics, network, secret } = configs;
  const http = new HTTPMessageBusClient(0, "", "", "");
  const grid = new GridClient(
    network,
    mnemonics,
    secret,
    http,
    type,
    "tfkvstore" as any
  );

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
  await grid.gateway.delete_name({ name: domainName });
  return await grid[key].delete({ name });
}
