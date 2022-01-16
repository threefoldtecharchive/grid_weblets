import { v4 } from "uuid";
import isValidInteger from "../utils/isValidInteger";
import NodeID from "./nodeId";

class SMTP {
  constructor(
    public password = "",
    public userName = "",
    public address = "smtp.gmail.com",
    public enableTLS = "true",
    public port = "587"
  ) {}
  public get valid(): boolean {
    return (
      this.password != "" &&
      this.userName != "" &&
      this.address != "" &&
      this.port != ""
    );
  }
}

export default class Discourse {
  constructor(
    public id = v4(),

    /* Base info */
    public name = "dc" + id.split("-")[0],
    public cpu = 2,
    public memory = 1024 * 4,
    public nodeId: number = null,
    public diskSize = 50,
    public developerEmail = "",
    public threepotPRKey = "",
    public smtp = new SMTP(),

    public publicKey = "",
    public version = "staging",
    public railsEvn = "production",
    public threebotURL = "https://login.threefold.me",
    public flaskSecretKey = "flasksecret",
    public openKYCURL = "https://openkyc.live/verification/verify-sei",
    public resticRepository = "s3:https://s3.grid.tf/forum-test",
    public resticPassword = "yourpass",
    public AWSAccessKeyID = "id",
    public AWSSecretAccessKey = "accesskey",

    public selection = new NodeID()
  ) {}

  public get valid(): boolean {
    const {
      name,
      cpu,
      memory,
      nodeId,
      smtp,
      developerEmail,
      threepotPRKey,
      resticPassword,
      resticRepository,
      AWSAccessKeyID,
      AWSSecretAccessKey,
    } = this;
    return (
      name !== "" &&
      isValidInteger(cpu) &&
      isValidInteger(memory) &&
      isValidInteger(nodeId) &&
      smtp.valid
    );
  }
}
