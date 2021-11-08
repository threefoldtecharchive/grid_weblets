import { v4 } from "uuid";
import isValidInteger from "../utils/isValidInteger";
import BaseConfig from "./baseConfig";

export default class Caprover {
  constructor(
    public id = v4(),

    /* Base info */
    public name = id.split("-")[0],
    public cpu = 1,
    public memory = 1024,
    public nodeId = 3,
    public domain = "",
    public publicKey = "",
    public diskSize = 1,

    public configs = new BaseConfig()
  ) {}

  public get valid(): boolean {
    const { name, cpu, memory, nodeId, domain, publicKey } = this;
    return (
      name !== "" &&
      isValidInteger(cpu) &&
      isValidInteger(memory) &&
      isValidInteger(nodeId) &&
      domain !== "" &&
      publicKey !== ""
    );
  }
}
