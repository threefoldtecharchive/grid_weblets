import { v4 } from "uuid";
import type { IFormField } from ".";
import isValidInteger from "../utils/isValidInteger";
import { validateDisk } from "../utils/validateName";
import { Network } from "./kubernetes";
import NodeID from "./nodeId";

export class Env {
  constructor(public id = v4(), public key = "", public value = "") {}

  public get valid(): boolean {
    const { key, value } = this;
    return key !== "" && value !== "";
  }
}

export class Disk {
  // prettier-ignore
  public diskFields: IFormField[] = [
    { label: "Name", symbol: "name", placeholder: "Disk Name", type: "text" },
    { label: "Size", symbol: "size", placeholder: "Disk size in GB", type: "number", validator: validateDisk },
    {
      label: "Mount Point", symbol: "mountpoint", placeholder: "Disk Mount Point", type: "text", validator(point: string): string | void {
        point = point.trim();
        if (point === "" || point === "/" || !point.startsWith("/")) return "Mount Point must start '/' and can't be positioned at root('/')"
      }, invalid: false
    },
  ]

  constructor(
    public id = v4(),
    public name = "DISK" + id.split("-")[0],
    public size = 50,
    public mountpoint = "/opt/"
  ) {}

  public get valid(): boolean {
    const { name, size, mountpoint } = this;
    let point = mountpoint.trim();

    return (
      name !== "" &&
      isValidInteger(size) &&
      point !== "" &&
      point !== "/" &&
      point.startsWith("/")
    );
  }
}

export default class VM {
  constructor(
    /* Base */
    public id = v4(),
    public name = "VM" + id.split("-")[0],
    public flist = "https://hub.grid.tf/tf-official-apps/base:latest.flist",
    public cpu = 4,
    public memory = 1024 * 8,
    public entrypoint = "/sbin/zinit init",
    public planetary = true,
    public nodeId: number = null,

    /* Network */
    public network = new Network(),

    public envs: Env[] = [],
    public disks: Disk[] = [],
    public publicIp = false,
    public publicIp6 = false,

    public selection = new NodeID()
  ) {}

  public get valid(): boolean {
    const { name, flist, cpu, memory, entrypoint, nodeId } = this;
    const { network, envs, disks } = this;
    return (
      name !== "" &&
      flist !== "" &&
      entrypoint !== "" &&
      isValidInteger(cpu) &&
      isValidInteger(memory) &&
      isValidInteger(nodeId) &&
      network.valid &&
      envs.reduce((res, env) => res && env.valid, true) &&
      disks.reduce((res, disk) => res && disk.valid, true)
    );
  }
}
