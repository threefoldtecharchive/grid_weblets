import type BaseConfig from "./baseConfig";
const { HTTPMessageBusClient } = window.configs?.client ?? {};
const { GridClient } = window.configs?.grid3_client ?? {};

interface IData {
  k8s?: any[];
  machines?: any[];
}

type IKey = "k8s" | "machines";
export default class DeployedList {
  private data: IData = {};
  constructor(private readonly grid: any) {}

  public async load(key: IKey) {
    console.log("loading", key);
    if (!this.data[key]) {
      const pointer = this.grid[key];
      const list = await pointer.list();
      const items: Promise<any>[] = list.map((n) => pointer.getObj(n));
      this.data[key] = await Promise.all(items);
    }

    return this.data[key];
  }

  public static init(configs: BaseConfig): Promise<DeployedList> {
    const { mnemonics, networkEnv, storeSecret } = configs;
    const http = new HTTPMessageBusClient(0, "");
    const grid = new GridClient(
      networkEnv,
      mnemonics,
      storeSecret,
      http,
      undefined,
      "tfkvstore" as any
    );
    return grid.connect().then(() => new DeployedList(grid));
  }
}
