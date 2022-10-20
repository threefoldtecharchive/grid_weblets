import { v4 } from "uuid";
import isValidInteger from "../utils/isValidInteger";
import rootFs from "../utils/rootFs";
import NodeID from "./nodeId";
import validateName, { validateIPRange } from '../utils/validateName';

export abstract class Base {
  public constructor(
    public id = v4(),
    public name: string = "WR" + id.split("-")[0],
    public node: number = null,
    public cpu: number = 2,
    public diskSize: number = 100,
    public publicIp: boolean = false,
    public publicIp6: boolean = false,
    public memory: number = 4096,
    public planetary: boolean = true,

    public selection = new NodeID(),
    public status: "valid" | "invalid" = null,
    public rootFs = 2,
    public rootFsEditable = false
  ) { }

  public get valid(): boolean {
    const { name, node, cpu, diskSize, memory, rootFs: rFs } = this;
    return (
      name !== "" &&
      validateName(name) === undefined &&
      isValidInteger(node) &&
      isValidInteger(cpu) &&
      isValidInteger(diskSize) &&
      isValidInteger(memory) &&
      rFs >= rootFs(cpu, memory)
    );
  }
}

export class Master extends Base { 
  public id = v4();
  public name: string = "MR" + this.id.split("-")[0];
 }
export class Worker extends Base { }

export class Network {
  constructor(
    public name: string = "NW" + v4().split("-")[0],
    public ipRange: string = "10.20.0.0/16"
  ) { }

  public get valid(): boolean {
    const { name, ipRange } = this;
    return name !== "" &&
      ipRange !== "" &&
      validateName(name) === undefined &&
      validateIPRange(ipRange) === undefined
  }
}

export default class Kubernetes {
  public constructor(
    public id = v4(),
    public master = new Master(),
    public workers = [],
    public network = new Network(),
    public name: string = "K8S" + id.split("-")[0],
    public secret: string = v4().split("-")[0],
    public metadata: string = "",
    public description: string = ""
  ) { }

  public get valid(): boolean {
    const { secret, master, workers, network } = this;
    return (
      secret !== "" &&
      master.valid &&
      network.valid &&
      workers.reduce((res, w) => res && w.valid, true)
    );
  }
}
