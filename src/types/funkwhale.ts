import generatePassword from "../utils/generatePassword";
import VM from "./vm";

export default class Funkwhale extends VM {
  /* Superuser settings */
  public adminEmail = "";
  public adminUsername = "admin";
  public adminPassword = generatePassword((length = Math.floor(Math.random() * 5) + 10)); // prettier-ignore
  public domain = "";
}
