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

  // remove named vms
  console.log({ grid });
  await grid.connect().then(() => {
    return grid[key].delete({ name });
  });

  grid.projectName = "";
  await grid._connect();

  // remove orphan vms
  console.log({ grid });
  return grid.connect().then(() => {
    return grid[key].delete({ name });
  });
}
