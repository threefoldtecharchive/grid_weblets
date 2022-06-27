import { v4 } from "uuid";
import VM from "./vm";

export default class NodePilot extends VM {
  public id = v4().split("-")[0];
  public name = `NP${this.id}`;


  public get valid(): boolean {
    return this.name !== "";
  }
}
