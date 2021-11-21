const { GridClient } = window.configs?.grid3_client ?? {};
const { HTTPMessageBusClient } = window.configs?.client ?? {};

interface IConfig {
  mnemonics: string;
  storeSecret: string;
  networkEnv: string;
}

export default function deleteContracts(
  configs: IConfig,
  key: "k8s" | "machines",
  name: string
) {
  const { mnemonics, networkEnv, storeSecret } = configs;
  const http = new HTTPMessageBusClient(0, "");
  const grid = new GridClient(
    networkEnv as any,
    mnemonics,
    storeSecret,
    http,
    undefined,
    "tfkvstore" as any
  );

  return grid.connect().then(() => {
    return grid[key].delete({ name });
  });
}
