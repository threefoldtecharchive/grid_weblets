import VM, { Disk } from "./vm";
import { v4 } from "uuid";

export default class FullVM extends VM {
  public name = `VM${v4().split("-")[0]}`;
  public diskSize: number = 15;
  public disks = [new Disk(undefined, undefined, this.diskSize, undefined)];

  public get valid(): boolean {
    const { name } = this;
    return name !== "";
  }
}
