import { v4 } from "uuid";
import VM from "./vm";

export default class Algorand extends VM {
  public id = v4().split("-")[0];
  public name = `al${this.id}`;
  public publicIp = false;

  // capacity
  public cpu;
  public memory;
  public rootSize;

  public customCapacity = false;

  // algo nodes config
  public nodeNetwork = "mainnet";
  public nodeType: "default" | "participant" | "relay" | "indexer" = "default";

  // the participation fields
  public mnemonics = "";
  public firstRound = 24000000;
  public lastRound = 26000000;

  // public participantNode = false
  // public relay: boolean = false

  public get valid(): boolean {
    return this.name !== "";
  }
}
