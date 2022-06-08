import { v4 } from "uuid";
import generatePassword from "../utils/generatePassword";
import isValidInteger from "../utils/isValidInteger";
import NodeID from "./nodeId";
import { Disk } from "./vm";

interface ITFHubValidator {
  name: string;
  flist: string;
  mnemonics: string;
  keyName: string;
  stakeAmount: string;
  moniker: string;
  chainId: string;
  ethereumAddress: string;
  ethereumPrivKey: string;
  gravityAddress: string;
  ethereumRpc: string;
  persistentPeers: string;
  genesisUrl: string;

  nodeId: number;
}

export default class TFHubValidator implements ITFHubValidator {
  id = v4();
  selection = new NodeID();
  status: "invalid" | "valid" = "invalid";

  name: string;
  flist: string;
  mnemonics: string;
  keyName: string;
  stakeAmount: string;
  moniker: string;
  chainId: string;
  ethereumAddress: string;
  ethereumPrivKey: string;
  gravityAddress: string;
  ethereumRpc: string;
  persistentPeers: string;
  genesisUrl: string;
  
  nodeId: number;

  public publicIp = false;
  public cpu = 2;
  public memory = 1024 * 4;
  public disks = [new Disk(undefined, undefined, 20, undefined)];

  constructor({
    name,
    flist,
    mnemonics,
    keyName,
    stakeAmount,
    moniker,
    chainId,
    ethereumAddress,
    ethereumPrivKey,
    gravityAddress,
    ethereumRpc,
    persistentPeers,
    genesisUrl,
    nodeId,
  }: Partial<ITFHubValidator> = {}) {
    this.name = "TFhub-" + name; 
    this.mnemonics = mnemonics;
    this.keyName = keyName || generatePassword(10);
    this.stakeAmount = stakeAmount;
    this.moniker = moniker || generatePassword(10);
    this.chainId = chainId;
    this.ethereumAddress = ethereumAddress;
    this.ethereumPrivKey = ethereumPrivKey;
    this.gravityAddress = gravityAddress;
    this.ethereumRpc = ethereumRpc;
    this.persistentPeers = persistentPeers;
    this.genesisUrl = genesisUrl || "https://gist.githubusercontent.com/ashraffouda/\
    1e494d95ad60ed8f72805c47a0493da7/raw/7855ae7a9f50023af0feffcc2049cb52595863e8/genesis.json";
    this.nodeId = nodeId;
  }

  get invalid(): boolean {
    const { 
      name, flist, mnemonics, keyName, 
    } = this;
    return false
    // return (
    //   name.trim() === "" ||
    //   !isValidInteger(port.trim()) ||
    //   !isValidInteger(nodeId)
    // );
  }
}
