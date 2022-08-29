import { v4 } from "uuid";
import VM from "./vm";

export default class Subsquid extends VM {
  public id = v4().split("-")[0];
  public name = `SS${this.id}`;
  public cpu = 8;
  public memory = 8192;
  public diskSize = 100;
  public endPoint = "";
  public publicIp = false;
  public domain = "";

  public get valid(): boolean {
    return this.name !== "" && this.endPoint !== "";
  }
}
