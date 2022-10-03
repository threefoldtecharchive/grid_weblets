import { v4 } from "uuid";
import isValidInteger from "../utils/isValidInteger";
import NodeID from "./nodeId";
import type { IFormField } from ".";
import { validateRequiredEmail, validateRequiredPassword, validateRequiredPortNumber } from "../utils/validateName";
import { validateRequiredHostName } from "../utils/validateDomainName";

import TweetNACL from "tweetnacl";
import { Disk } from "./vm";

function generatePubKey(): String {
  const keypair = TweetNACL.box.keyPair();
  return window.configs.buffer.Buffer.from(keypair.publicKey).toString(
    "base64"
  );
}

class SMTP {
  public fields: IFormField[] = [
    {
      label: "Host Name",
      symbol: "address",
      placeholder: "smtp.example.com",
      type: "text",
      validator: validateRequiredHostName,
      invalid: false,
    },
    {
      label: "Port",
      symbol: "port",
      placeholder: "587",
      type: "text",
      validator: validateRequiredPortNumber,
      invalid: false,
    },
    {
      label: "Username",
      symbol: "userName",
      placeholder: "user@example.com",
      type: "text",
      validator: validateRequiredEmail,
      invalid: false,
    },
    {
      label: "Password",
      symbol: "password",
      placeholder: "Password",
      type: "password",
      validator: validateRequiredPassword,
      invalid: false,
    },
    { label: "Use TLS", symbol: "enableTLS", type: "checkbox" },
  ];
  constructor(
    public password = "",
    public userName = "",
    public address = "smtp.gmail.com",
    public enableTLS = true,
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
    public name = "DC" + id.split("-")[0],
    public cpu = 2,
    public memory = 1024 * 4,
    public diskSize = 50,
    public disks = [new Disk(undefined, undefined, diskSize, undefined)],
    public domain = "",

    public developerEmail = "",

    public smtp = new SMTP(),

    public threebotPRKey = generatePubKey(),
    public flaskSecretKey = v4().split("-")[0],

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
