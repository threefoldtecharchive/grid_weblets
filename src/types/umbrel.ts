import { v4 } from "uuid";
import VM from "./vm";
import generatePassword from "../utils/generatePassword";
export default class Umbrel extends VM {
  public id = v4().split("-")[0];
  public name = `UM${this.id}`;
  public username;
  public password = generatePassword(12);
  public domain = "";
}
