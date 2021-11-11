import type BaseConfig from "./baseConfig";
import getSignerObj from "../utils/getSignerObj";
const { HTTPMessageBusClient } = window.configs?.client ?? {};
const { GridClient } = window.configs?.grid3_client ?? {};
const { web3Accounts, web3Enable, web3FromSource } =
  window.configs?.polkadot ?? {};

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

  public static async init(configs: BaseConfig): Promise<DeployedList> {
    const { mnemonics, networkEnv, storeSecret } = configs;
    const http = new HTTPMessageBusClient(0, "");
    const grid = new GridClient(
      networkEnv,
      mnemonics,
      await getSignerObj("Deploy List"),
      storeSecret,
      http,
      "",
      "tfkvstore" as any
    );
    await grid.connect();
    return new DeployedList(grid);
  }
}
