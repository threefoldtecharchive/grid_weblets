import VM, { Disk } from "./vm";
import { v4 } from "uuid";

export default class Peertube extends VM {
  public name = `CI${v4().split("-")[0]}`;
  public cpu = 2;
  public memory = 1024 * 2;
  public disks = [new Disk(undefined, undefined, 20, undefined)];

  public get valid(): boolean {
    const { name } = this;
    return name !== "";
  }
}
