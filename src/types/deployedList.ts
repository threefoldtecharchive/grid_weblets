import getGrid from "../utils/getGrid";
import type { IProfile } from "./Profile";
import type { GridClient } from "grid3_client";
import formatConsumption from "../utils/formatConsumption";

export default class DeployedList {
  constructor(public readonly grid: GridClient) { }

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
        ? (this.grid.projectName = projectName) // to load project named deployments
        : (this.grid.projectName = ""); // to load orphan deployments
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

  public async loadDeployments(type) {
    // list the deployment created without project name that includes `flistkey` "Backward compatibility"
    let deps1 = await this.loadVm().then((vms) => {
      return vms.filter((vm) => vm.flist.toLowerCase().includes(type));
    });

    // list deployments create with project name
    let deps2 = await this.loadVm(type);

    return [...deps1, ...deps2];
  }

  public loadCasperlabs(): Promise<any[]> {
    return this.loadVm().then((vms) => {
      return vms.filter((vm) => vm.flist.toLowerCase().includes("casperlabs"));
    });
  }

  public static async init(profile: IProfile): Promise<DeployedList> {
    return new DeployedList(await getGrid(profile, (grid) => grid, false));
  }
}
