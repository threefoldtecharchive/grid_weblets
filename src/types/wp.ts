import { v4 } from "uuid";
import VM from "./vm";
import generatePassword from "../utils/generatePassword";
export default class Wordpress extends VM {
  public id = v4().split("-")[0];
  public name = `WP${this.id}`;
  public adminEmail = "";
  public adminUsername = "admin";
  public adminPassword = generatePassword(length); // prettier-ignore
  public domain = "";
}
