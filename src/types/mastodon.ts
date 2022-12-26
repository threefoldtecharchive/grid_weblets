import { v4 } from "uuid";
import generatePassword from "../utils/generatePassword";
import isValidInteger from "../utils/isValidInteger";
import NodeID from "./nodeId";
import { Disk } from "./vm";

interface IMastodon {
  name: string;
  adminUsername: string;
  adminEmail: string;
  adminPassword: string;
  domain: string;
  nodeId: number;
  tfConnect: boolean;

  SMTP_SERVER: string;
  SMTP_PORT: string;
  SMTP_EMAIL: string;
  SMTP_PASSWORD: string;
}

export default class Mastodon implements IMastodon {
  id = v4();
  selection = new NodeID();
  status: "invalid" | "valid" = "invalid";

  name: string;
  adminUsername: string;
  adminPassword: string;
  adminEmail: string;
  domain: string;
  nodeId: number;
  tfConnect: boolean;

  SMTP_SERVER: string;
  SMTP_PORT: string;
  SMTP_EMAIL: string;
  SMTP_PASSWORD: string;

  public publicIp = false;
  public cpu = 2;
  public memory = 1024 * 2;
  public disks = [new Disk(undefined, undefined, 20, undefined)];

  constructor({
    name,
    adminUsername,
    adminEmail,
    adminPassword,
    domain,
    nodeId,
    tfConnect,

    SMTP_SERVER,
    SMTP_PORT,
    SMTP_EMAIL,
    SMTP_PASSWORD,
  }: Partial<IMastodon> = {}) {
    this.name = name || "MD" + this.id.split("-")[0];
    this.adminUsername = adminUsername || "adminuser";
    this.adminPassword = adminPassword || generatePassword(10);
    this.adminEmail = adminEmail;
    this.domain = domain || "";
    this.nodeId = nodeId;
    this.tfConnect = tfConnect || false;

    this.SMTP_SERVER = SMTP_SERVER || "smtp.gmail.com";
    this.SMTP_PORT = SMTP_PORT || "587";
    this.SMTP_PASSWORD = SMTP_PASSWORD || "";
    this.SMTP_EMAIL = SMTP_EMAIL || "";
  }

  get invalid(): boolean {
    const { name, nodeId } = this;
    return name.trim() === "" || !isValidInteger(nodeId);
  }
}
