import { v4 } from "uuid";
import isValidInteger from "../utils/isValidInteger";
import { Network } from "./kubernetes";
import NodeID from "./nodeId";
import { Disk } from "./vm";

interface IMattermost {
  name: string;
  username: string;
  password: string;
  dbUsername: string;
  nodeId: number;
}

export default class Mattermost implements IMattermost {
  name: string;
  username: string;
  password: string;
  dbUsername: string;
  nodeId: number;

  /* default info */
  id = v4();
  network = new Network();
  selection = new NodeID();
  status: "invalid" | "valid" = "invalid";
  cpu = 2;
  memory = 2048;
  publicIp = true;
  planetary = true;
  disk = new Disk(undefined, undefined, 50);
  rootFsSize = 10;

  constructor({
    name,
    username,
    password,
    dbUsername,
    nodeId,
  }: Partial<IMattermost> = {}) {
    this.name = name || "MM" + this.id.split("-")[0];
    this.username = username || "";
    this.password = password || "";
    this.dbUsername = dbUsername || "";
    this.nodeId = nodeId;
  }

  get invalid(): boolean {
    const { name, username, password, dbUsername, nodeId } = this;
    return (
      name.trim() === "" ||
      username.trim() === "" ||
      password.trim() === "" ||
      dbUsername.trim() === "" ||
      !isValidInteger(nodeId)
    );
  }
}
