import getGrid from "../utils/getGrid";
import type { IProfile } from "./Profile";
import type { GridClient } from "grid3_client";

export default class DeployedList {
  constructor(public readonly grid: GridClient) {}

  private _loadK8s(name: string) {
    return new Promise((res) => {
      this.grid.k8s
        .getObj(name)
        .then((data) => {
          if (data.masters.length === 0) {
            // Temp solution for now
            return res(null);
          }
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
        return data.filter((x) => [null, undefined].includes(x) === false);
      });
  }

  private _loadVm(name: string) {
    return new Promise((res) => {
      this.grid.machines
        .getObj(name)
        .then(([data]) =>
          res({
            name,
            publicIp: (data.publicIP as any)?.ip ?? "None",
            yggIP: data.yggIP,
            flist: data.flist,
            details: data,
          })
        )
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
        return data.filter((x) => [null, undefined].includes(x) === false);
      });
  }

  public loadCaprover(): Promise<any[]> {
    return this.loadVm().then((vms) => {
      return vms.filter((vm) => vm.flist.toLowerCase().includes("caprover"));
    });
  }

  public loadFunkwhale(): Promise<any[]> {
    return this.loadVm().then((vms) => {
      return vms.filter((vm) => vm.flist.toLowerCase().includes("funk"));
    });
  }

  public loadPeertube(): Promise<any[]> {
    return this.loadVm().then((vms) => {
      return vms.filter((vm) => vm.flist.toLowerCase().includes("peertube"));
    });
  }

  public static async init(profile: IProfile): Promise<DeployedList> {
    return new DeployedList(await getGrid(profile, (grid) => grid, false));
  }
}
