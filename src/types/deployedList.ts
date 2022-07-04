import getGrid from "../utils/getGrid";
import type { IProfile } from "./Profile";
import type { GridClient } from "grid3_client";
import formatConsumption from "../utils/formatConsumption";

export interface IListReturn<T = any> {
  total: number;
  data: T[];
}

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

          const k8sContracts = Array.from(new Set<any>([data.masters[0].contractId, ...data.workers.map(({ contractId }) => contractId)]));
          const prices = await Promise.all([...k8sContracts.map(contractId => this.grid.contracts.getConsumption({ id: contractId }).catch(() => 0))]);

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
  public loadK8s(): Promise<IListReturn> {
    let total = 0;
    try {
      return this.grid.k8s
        .list()
        .then(DeployedList.__filterNames)
        .then((names) => {
          total = names.length;
          return Promise.all(names.map((name) => this._loadK8s(name)));
        })
        .then((d) => d.filter((x) => [null, undefined].includes(x) === false))
        .then((data) => {
          return {
            total,
            data,
          };
        })
        .then(DeployedList._sortK8sList);
    } catch {
      return Promise.resolve({
        total,
        data: [],
      });
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

  public loadVm(projectName?: string): Promise<IListReturn> {
    let total = 0;

    try {
      projectName
        ? (this.grid.projectName = projectName) // to load project named deployments
        : (this.grid.projectName = ""); // to load orphan deployments
      this.grid._connect(); // update the values of grid props

      return this.grid.machines
        .list()
        .then(DeployedList.__filterNames)
        .then((names) => {
          total = names.length;
          return Promise.all(names.map((name) => this._loadVm(name)));
        })
        .then((d) => d.filter((x) => [null, undefined].includes(x) === false))
        .then((data) => {
          return {
            total,
            data,
          };
        })
        .then(DeployedList._sortVMList);
    } catch {
      return Promise.resolve({
        total,
        data: [],
      });
    }
  }

  public async loadDeployments(type?: string): Promise<IListReturn> {
    if (!type) return this.loadVm();

    // list the deployment created without project name that includes `flistkey` "Backward compatibility"
    let deps1 = await this.loadVm().then((vms) => {
      return vms.data.filter((vm) => vm.flist.toLowerCase().includes(type));
    });

    // list deployments create with project name
    let deps2 = await this.loadVm(type);

    return {
      total: deps2.total + deps1.length,
      data: [...deps1, ...deps2.data],
    };
  }

  public static async init(profile: IProfile): Promise<DeployedList> {
    return new DeployedList(await getGrid(profile, (grid) => grid, false));
  }

  public static __filterNames(names: string[]): string[] {
    return names.filter((name) => !name.startsWith("."));
  }

  public static _sortVMList(vms: any): any {
    vms.data.sort((a, b) => a.details.created - b.details.created);
    return vms;
  }

  public static _sortK8sList(k8s: any): any {
    k8s.data.sort(
      (a, b) => a.details.masters[0].created - b.details.masters[0].created
    );
    return k8s;
  }
}
