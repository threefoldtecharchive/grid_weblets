import VM from "./vm";
import generatePassword from "../utils/generatePassword";

export default class Taiga extends VM {
  /* Superuser settings */
  public adminEmail = "";
  public adminUsername = "admin";
  public adminPassword = generatePassword((length = Math.floor(Math.random() * 5) + 10)); // prettier-ignore

  /* Mail server settings */
  public smtpFromEmail = "";
  public smtpHost = "";
  public smtpPort = "";
  public smtpHostUser = "";
  public smtpHostPassword = "";

  public smtpUseTLS = false;
  public smtpUseSSL = false;
}
