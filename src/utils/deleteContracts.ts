import { getUniqueDomainName } from "./gatewayHelpers";

const { GridClient } = window.configs?.grid3_client ?? {};
const { HTTPMessageBusClient } = window.configs?.client ?? {};

interface IConfig {
  mnemonics: string;
  storeSecret: string;
  networkEnv: string;
}

export default async function deleteContracts(
  configs: IConfig,
  key: "k8s" | "machines",
  name: string,
  type: string
) {
  const { mnemonics, networkEnv, storeSecret } = configs;
  const http = new HTTPMessageBusClient(0, "", "", "");
  const grid = new GridClient(
    networkEnv as any,
    mnemonics,
    storeSecret,
    http,
    type,
    "tfkvstore" as any
  );

  // remove deployment in namespace `type`
  console.log({ grid });
  const obj = await grid.connect().then(() => {
    return grid[key].delete({ name });
  });

  // if (obj["deleted"].length) {
  //   return obj;
  // }

  // remove deployments (vm, gw) in default namespace ``
  grid.projectName = "";
  await grid._connect();
  console.log({ grid });

  return grid.connect().then(() => {
    return grid[key].delete({ name } /* test */).then(async () => {
      const domainName = await getUniqueDomainName(configs, name, type);
      await grid.gateway.delete_name({ name: domainName });
    });
  });
}
