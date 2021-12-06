import { v4 } from "uuid";
import isValidInteger from "../utils/isValidInteger";
import NodeID from "./nodeId";

export abstract class Base {
  public constructor(
    public id = v4(),
    public name: string = "WR" + id.split("-")[0],
    public node: number = null,
    public cpu: number = 2,
    public diskSize: number = 100,
    public publicIp: boolean = false,
    public memory: number = 4096,
    public rootFsSize: number = 50,
    public planetary: boolean = true,

    public selection = new NodeID()
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
    public name: string = "NW" + v4().split("-")[0],
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
    public name: string = "K8S" + id.split("-")[0],
    public secret: string = v4().split("-")[0],
    public sshKey: string = "",
    public metadata: string = "",
    public description: string = ""
  ) {}

  public get valid(): boolean {
    const { secret, sshKey, master, workers, network } = this;
    return (
      secret !== "" &&
      sshKey !== "" &&
      master.valid &&
      network.valid &&
      workers.reduce((res, w) => res && w.valid, true)
    );
  }
}
