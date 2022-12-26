import { v4 } from "uuid";
import isValidInteger from "../utils/isValidInteger";
import generatePassword from "../utils/generatePassword";
import NodeID from "./nodeId";
import { SelectCapacityUpdate } from "./index";
const length = Math.floor(Math.random() * 5) + 10;
export default class Caprover {
  constructor(
    public id = v4(),

    /* Base info */
    public name = "CR" + id.split("-")[0],
    public workers: CapWorker[] = [],
    public cpu = 4,
    public memory = 1024 * 8,
    public nodeId: number = null,
    public domain = "",
    public publicKey = "",
    public diskSize = 100,
    public password = generatePassword(length), // password length between 10 and 14
    public selection = new NodeID(),
  ) {}

  public get valid(): boolean {
    const { name, workers, cpu, memory, nodeId, domain, publicKey } = this;
    return (
      name !== "" &&
      isValidInteger(cpu) &&
      isValidInteger(memory) &&
      isValidInteger(nodeId) &&
      domain !== "" &&
      publicKey !== "" &&
      workers.every(worker => worker.valid)
    );
  }
}

export class CapWorker {
  public selectCapacity = new SelectCapacityUpdate();

  public constructor(
    public id = v4(),

    /* Base info */
    public name = "WR" + id.split("-")[0],
    public cpu = 4,
    public memory = 1024 * 8,
    public nodeId: number = null,
    public publicKey = "",
    public diskSize = 100,
    public selection = new NodeID(),
    public status: "valid" | "invalid" = null,
  ) {}

  public get valid(): boolean {
    const { name, cpu, memory, nodeId } = this;
    return name !== "" && isValidInteger(cpu) && isValidInteger(memory) && isValidInteger(nodeId);
  }
}
