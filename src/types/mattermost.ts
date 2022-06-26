import { v4 } from "uuid";
import generatePassword from "../utils/generatePassword";
import isValidInteger from "../utils/isValidInteger";
import NodeID from "./nodeId";
import { Disk } from "./vm";

interface IMattermost {
  name: string;
  username: string;
  password: string;
  smtpPassword: string;
  nodeId: number;
  domain: string;
  server: string;
  port: string;
}

export default class Mattermost implements IMattermost {
  id = v4();
  selection = new NodeID();
  status: "invalid" | "valid" = "invalid";

  name: string;
  username: string;
  password: string;
  nodeId: number;
  smtpPassword: string;
  domain: string;
  server: string;
  port: string;
  public publicIp = false;
  public cpu = 2;
  public memory = 1024 * 2;
  public disks = [new Disk(undefined, undefined, 20, undefined)];

  constructor({
    name,
    username,
    password,
    nodeId,
    domain,
    server,
    port,
    smtpPassword,
  }: Partial<IMattermost> = {}) {
    this.name = name || "MM" + this.id.split("-")[0];
    this.username = username || "";
    this.password = password || this.id.split("-")[0];
    this.smtpPassword = smtpPassword || generatePassword(10);
    this.nodeId = nodeId;
    this.domain = domain || "";
    this.server = server || "smtp.gmail.com";
    this.port = port || "587";
  }

  get invalid(): boolean {
    const { name, username, password, nodeId } = this;
    const { domain, server, port } = this;
    return (
      name.trim() === "" ||
      // username.trim() === "" ||
      // password.trim() === "" ||
      // // domain.trim() === "" ||
      // server.trim() === "" ||
      // port.trim() === "" ||
      // !isValidInteger(port.trim()) ||
      !isValidInteger(nodeId)
    );
  }
}
