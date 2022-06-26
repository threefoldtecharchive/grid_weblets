import generatePassword from "../utils/generatePassword";
import VM from "./vm";
import { v4 } from "uuid";

export default class Funkwhale extends VM {
  /* Superuser settings */
  public id = v4();
  public name = "FW" +this.id.split("-")[0];


  public adminEmail = "";
  public adminUsername = "admin";
  public adminPassword = generatePassword((length = Math.floor(Math.random() * 5) + 10)); // prettier-ignore
  public domain = "";
}
