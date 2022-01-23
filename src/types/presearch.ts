import { v4 } from "uuid";
import VM from "./vm";

export default class Presearch extends VM {
  public id = v4().split("-")[0];
  public name = `ps${this.id}`;
  public cpu = 2;
  public memory = 1024 * 8;
  public diskSize = 50;
  public preCode = "";

  public get valid(): boolean {
    return this.name !== "" && this.preCode !== "";
  }
}
