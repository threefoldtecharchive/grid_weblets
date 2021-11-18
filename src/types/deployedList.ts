import type { IProfile } from "./Profile";
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
      const items: Promise<any>[] = list.map(
        (n) =>
          new Promise((res) => {
            pointer
              .getObj(n)
              .then(res)
              .catch(() => res(null));
          })
      );
      this.data[key] = (await Promise.all(items)).filter((x) =>
        x instanceof Array ? !!x[0] : !!x
      );
    }

    return this.data[key];
  }

  public static async init(configs: IProfile): Promise<DeployedList> {
    const { mnemonics, networkEnv, storeSecret } = configs;
    const http = new HTTPMessageBusClient(0, "");
    const grid = new GridClient(
      networkEnv as any,
      mnemonics,
      storeSecret,
      http,
      "",
      "tfkvstore" as any
    );
    await grid.connect();
    return new DeployedList(grid);
  }
}
