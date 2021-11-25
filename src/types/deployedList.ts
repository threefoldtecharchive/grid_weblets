import type { IProfile } from "./Profile";
const { HTTPMessageBusClient } = window.configs?.client ?? {};
const { GridClient } = window.configs?.grid3_client ?? {};
// import type { GridClient } from "grid3_client";

interface IData {
  k8s?: any[];
  machines?: any[];
}

type IKey = "k8s" | "machines";
export default class DeployedList {
  constructor(private readonly grid: any) {}

  private _loadK8s(name: string) {
    return new Promise((res) => {
      this.grid.k8s
        .getObj(name)
        .then((data) => {
          res({
            name,
            master: data.masters[0],
            workers: data.workers.length,
            details: data,
          });
        })
        .catch(() => res(null));
    });
  }
  public loadK8s(): Promise<any[]> {
    return this.grid.k8s
      .list()
      .then((names) => {
        return Promise.all(names.map((name) => this._loadK8s(name)));
      })
      .then((data) => {
        return data.filter((x) => [null, undefined].includes(x)  === false);
      });
  }

  private _loadVm(name: string) {
    return new Promise((res) => {
      this.grid.machines
        .getObj(name)
        .then(([data]) => res(data))
        .catch(() => res(null));
    });
  }

  public loadVm(): Promise<any[]> {
    return this.grid.machines
      .list()
      .then((names) => {
        console.log("names: " + names);
        return Promise.all(names.map((name) => this._loadVm(name)));
      })
      .then((data) => {
        console.log(data);
        return data.filter((x) => [null, undefined].includes(x)  === false);
      });
  }

  public loadCaprover(): Promise<any[]> {
    return this.loadVm().then((vms) => {
      return vms.filter((vm) => vm.name.startsWith("caprover_leader"));
    });
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
