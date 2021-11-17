import { v4 } from "uuid";
import BaseConfig from "./baseConfig";
import isValidInteger from "../utils/isValidInteger";

export abstract class Base {
  public constructor(
    public id = v4(),
    public name: string = id.split("-")[0],
    public node: number = 0,
    public cpu: number = 0,
    public diskSize: number = 0,
    public publicIp: boolean = false,
    public memory: number = 0,
    public rootFsSize: number = 0,
    public plantery: boolean = true
  ) {}

  public get valid(): boolean {
    const { name, node, cpu, diskSize, memory, rootFsSize } = this;
    return (
      name !== "" &&
      isValidInteger(node) &&
      isValidInteger(cpu) &&
      isValidInteger(diskSize) &&
      isValidInteger(memory) &&
      isValidInteger(rootFsSize)
    );
  }
}

export class Master extends Base {}
export class Worker extends Base {}

export class Network {
  constructor(
    public name: string = "",
    public ipRange: string = "10.20.0.0/16"
  ) {}

  public get valid(): boolean {
    const { name, ipRange } = this;
    return name !== "" && ipRange !== "";
  }
}

export default class Kubernetes {
  public constructor(
    public id = v4(),
    public master = new Master(),
    public workers = [new Worker()],
    public network = new Network(),
    public name: string = "",
    public secret: string = "",
    public sshKey: string = "",
    public metadata: string = "",
    public description: string = "",
    public configs = new BaseConfig()
  ) {}

  public get valid(): boolean {
    const { secret, sshKey, master, workers, configs, network } = this;
    return (
      secret !== "" &&
      sshKey !== "" &&
      configs.valid &&
      master.valid &&
      network.valid &&
      workers.reduce((res, w) => res && w.valid, true)
    );
  }
}
