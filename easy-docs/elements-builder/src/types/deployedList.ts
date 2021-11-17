import type BaseConfig from "./baseConfig";
const { HTTPMessageBusClient } = window.configs.client;
const { GridClient } = window.configs.grid3_client;

interface IData {
  k8s?: any[];
  machines?: any[];
}

export default class DeployedList {
  private data: IData = {};
  constructor(private readonly grid: any) {}

  public get kubernetes(): IData["k8s"] {
    if (!this.data.k8s) {
      this._loadData("k8s");
    }
    return this.data.k8s ?? [];
  }

  public get vms(): IData["machines"] {
    if (!this.data.machines) {
      this._loadData("machines");
    }
    return this.data.machines ?? [];
  }

  private async _loadData<T extends keyof IData>(key: T): Promise<void> {
    const mapper = (name: string) => this.grid[key].getObj(name);
    const calls = this.grid[key].list().map(mapper);
    this.data[key] = await Promise.all(calls as any);
    console.log(key, this.data[key]);
  }

  public static init(configs: BaseConfig): Promise<DeployedList> {
    const { proxyURL, url, mnemonics } = configs;
    const http = new HTTPMessageBusClient(0, proxyURL);
    const grid = new GridClient(url, mnemonics, http);
    return grid.connect().then(() => new DeployedList(grid));
  }
}
