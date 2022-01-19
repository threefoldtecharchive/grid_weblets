import { v4 } from "uuid";
import isValidInteger from "../utils/isValidInteger";
import NodeID from "./nodeId";
import type { IFormField } from ".";
import { validateEmail } from "../utils/validateName";

import TweetNACL from "tweetnacl";

function generatePubKey(): String {
  const keypair = TweetNACL.box.keyPair();
  return window.configs.buffer.Buffer.from(keypair.publicKey).toString("base64");
}

class SMTP {
  public fields: IFormField[] = [
    {
      label: "SMTP Name",
      symbol: "userName",
      placeholder: "SMTP Name",
      type: "text",
      validator: validateEmail,
      invalid: false,
    },
    {
      label: "SMTP Password",
      symbol: "password",
      placeholder: "SMTP password",
      type: "password",
      invalid: false,
    },
  ];
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
    public diskSize = 50,
    public publicIp = false,
    public planetary = true,

    public developerEmail = "",

    public smtp = new SMTP(),

    public threebotPRKey = generatePubKey(),
    public flaskSecretKey = v4(),

    public nodeId: number = null,
    public selection = new NodeID()
  ) {}

  public get valid(): boolean {
    const { name, cpu, memory, nodeId, smtp, developerEmail, threebotPRKey } =
      this;
    return (
      name !== "" &&
      isValidInteger(cpu) &&
      isValidInteger(memory) &&
      isValidInteger(nodeId) &&
      smtp.valid
    );
  }
}
