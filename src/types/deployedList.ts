import getGrid from "../utils/getGrid";
import type { IProfile } from "./Profile";
import type { GridClient } from "grid3_client";
import formatConsumption from "../utils/formatConsumption";

export default class DeployedList {
  constructor(public readonly grid: GridClient) {}

  private _loadK8s(name: string) {
    return new Promise((res) => {
      this.grid.k8s
        .getObj(name)
        .then(async (data) => {
          if (data.masters.length === 0) {
            // Temp solution for now
            return res(null);
          }

          // prettier-ignore
          const prices = await Promise.all([
            this.grid.contracts.getConsumption({ id: data.masters[0].contractId }).catch(() => 0),
            ...data.workers.map(({ contractId }) => this.grid.contracts.getConsumption({ id: contractId }).catch(() => 0))
          ]);

          const value = prices.reduce((a, b) => a + b, 0);

          res({
            name,
            master: data.masters[0],
            workers: data.workers.length,
            details: data,
            consumption: formatConsumption(value),
          });
        })
        .catch(() => res(null));
    });
  }
  public loadK8s(): Promise<any[]> {
    try {
      return this.grid.k8s
        .list()
        .then((names) => {
          return Promise.all(names.map((name) => this._loadK8s(name)));
        })
        .then((data) => {
          return data.filter((x) => [null, undefined].includes(x) === false);
        });
    } catch {
      return Promise.resolve([]);
    }
  }

  private _loadVm(name: string) {
    return new Promise((res) => {
      this.grid.machines
        .getObj(name)
        .then(async ([data]) => {
          const publicIP = data.publicIP ?? ({} as any);
          return res({
            name,
            publicIp: publicIP.ip || "None",
            publicIp6: publicIP.ip6 || "None",
            planetary: data.planetary || "None",
            flist: data.flist,
            consumption: await this.grid.contracts
              .getConsumption({
                id: data.contractId as number,
              })
              .then(formatConsumption)
              .catch(() => formatConsumption(0)),
            details: data,
          });
        })
        .catch(() => res(null));
    });
  }

  public loadVm(projectName?: string): Promise<any[]> {
    try {
      projectName
        ? (this.grid.projectName = projectName)
        : (this.grid.projectName = "");
      this.grid._connect(); // update the values of grid props
      return this.grid.machines
        .list()
        .then((names) => {
          return Promise.all(names.map((name) => this._loadVm(name)));
        })
        .then((data) => {
          return data.filter((x) => [null, undefined].includes(x) === false);
        });
    } catch {
      return Promise.resolve([]);
    }
  }

  public loadCaprover(): Promise<any[]> {
    return this.loadVm("CapRover");
  }

  public loadDiscourse(): Promise<any[]> {
    return this.loadVm("Discourse");
  }

  public loadFunkwhale(): Promise<any[]> {
    return this.loadVm("Funkwhale");
  }

  public loadPeertube(): Promise<any[]> {
    return this.loadVm("Peertube");
  }

  public loadMattermost(): Promise<any[]> {
    return this.loadVm("Mattermost");
  }

  public loadOwncloud(): Promise<any[]> {
    return this.loadVm("Owncloud");
  }

  public loadTaiga(): Promise<any[]> {
    return this.loadVm("Taiga");
  }
  public loadPresearch(): Promise<any[]> {
    return this.loadVm("Presearch");
  }

  public static async init(profile: IProfile): Promise<DeployedList> {
    return new DeployedList(await getGrid(profile, (grid) => grid, false));
  }
}
