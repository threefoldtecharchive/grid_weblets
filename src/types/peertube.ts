import generatePassword from "../utils/generatePassword";
import VM, { Disk } from "./vm";
import { v4 } from "uuid";

export default class Peertube extends VM {
  public name = `PT${v4().split("-")[0]}`;
  public adminEmail = "";
  public adminPassword = generatePassword((length = Math.floor(Math.random() * 5) + 10)); // prettier-ignore
  public publicIp = false;
  public cpu = 2;
  public memory = 1024 * 2;
  public disks = [new Disk(undefined, undefined, 20, undefined)];
  public domain = "";

  public get valid(): boolean {
    const { name, adminEmail, adminPassword } = this;
    return name !== "" && adminEmail !== "" && adminPassword !== "";
  }
}
