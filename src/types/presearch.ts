import { v4 } from "uuid";
import VM from "./vm";

export default class Presearch extends VM {
  public id = v4().split("-")[0];
  public name = `ps${this.id}`;
  public cpu = 1;
  public memory = 1024 * 1;
  public diskSize = 20;
  public preCode = "";
  public privateRestoreKey = "";
  public publicRestoreKey = "";

  public get valid(): boolean {
    return this.name !== "" && this.preCode !== "";
  }
}
