import VM from "./vm";
import generatePassword from "../utils/generatePassword";
import isValidInteger from "../utils/isValidInteger";
import { validateEmail, validateOptionalEmail } from "../utils/validateName";
import validateName from "../utils/validateName";
import validateDomainName from "../utils/validateDomainName";
import { v4 } from "uuid";
export default class Taiga extends VM {
  /* Superuser settings */
  public id = v4();
  public name = "TG" +this.id.split("-")[0];
  public adminEmail = "";
  public adminUsername = "admin";
  public adminPassword = generatePassword((length = Math.floor(Math.random() * 5) + 10)); // prettier-ignore

  /* Mail server settings */
  public smtpFromEmail = "";
  public smtpHost = "";
  public smtpPort = "";
  public smtpHostUser = "";
  public smtpHostPassword = "";
  public domain = "";

  public smtpUseTLS = false;
  public smtpUseSSL = false;
  public get valid(): boolean {
    const { name, flist, cpu, memory, entrypoint, nodeId } = this;
    const { network, envs, disks } = this;
    const { adminEmail, adminUsername, adminPassword } = this;
    const {
      smtpFromEmail,
      smtpHost,
      smtpPort,
      smtpHostUser,
      smtpHostPassword,
    } = this;

    return (
      name !== "" &&
      flist !== "" &&
      entrypoint !== "" &&
      isValidInteger(cpu) &&
      isValidInteger(memory) &&
      isValidInteger(nodeId) &&
      network.valid &&
      envs.reduce((res, env) => res && env.valid, true) &&
      disks.reduce((res, disk) => res && disk.valid, true) &&
      !validateEmail(adminEmail) &&
      !validateName(adminUsername) &&
      adminPassword !== "" &&
      !validateOptionalEmail(smtpFromEmail) &&
      !validateOptionalEmail(smtpHostUser) &&
      (!validateDomainName(smtpHost) || smtpHost === "") &&
      (isValidInteger(smtpPort) || smtpPort === "")
    );
  }
}
