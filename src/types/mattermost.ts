import { v4 } from "uuid";
import isValidInteger from "../utils/isValidInteger";
import NodeID from "./nodeId";

interface IMattermost {
  name: string;
  username: string;
  password: string;
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
  domain: string;
  server: string;
  port: string;

  constructor({
    name,
    username,
    password,
    nodeId,
    domain,
    server,
    port,
  }: Partial<IMattermost> = {}) {
    this.name = name || "mm" + this.id.split("-")[0];
    this.username = username || "";
    this.password = password || "";
    this.nodeId = nodeId;
    this.domain = domain || "";
    this.server = server || "";
    this.port = port || "8000";
  }

  get invalid(): boolean {
    const { name, username, password, nodeId } = this;
    const { domain, server, port } = this;
    return (
      name.trim() === "" ||
      username.trim() === "" ||
      password.trim() === "" ||
      // domain.trim() === "" ||
      server.trim() === "" ||
      port.trim() === "" ||
      !isValidInteger(port.trim()) ||
      !isValidInteger(nodeId)
    );
  }
}
