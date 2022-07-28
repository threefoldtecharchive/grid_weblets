import { v4 } from "uuid";
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
  ssh_key: string;
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
  ssh_key: string;
  nodeId: number;

  public publicIp = true;
  public planetary = true;
  public cpu = 2;
  public memory = 1024 * 4;
  public disks = [new Disk(undefined, undefined, 20, undefined)];
  constructor({
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
    ssh_key,
  }: Partial<ITFHubValidator> = {}) {
    this.name = "VAL" + this.id.split("-")[0];
    this.mnemonics = mnemonics || "";
    this.keyName = keyName || "";
    this.stakeAmount = stakeAmount || "10000000TFT";
    this.moniker = moniker || "";
    this.chainId = chainId;
    this.ethereumAddress = ethereumAddress || "";
    this.ethereumPrivKey = ethereumPrivKey || "";
    this.gravityAddress = gravityAddress;
    this.ethereumRpc = ethereumRpc;
    this.persistentPeers = persistentPeers;
    this.genesisUrl = genesisUrl;
    this.nodeId = nodeId;
    this.ssh_key = ssh_key;
  }

  get invalid(): boolean {
    const { 
      mnemonics,
      stakeAmount,
      ethereumAddress,
      ethereumPrivKey,
    } = this;
    return (
      mnemonics.trim() === "" ||
      stakeAmount.trim() === "" ||
      ethereumAddress.trim() === "" ||
      ethereumPrivKey.trim() === ""
    );
  }
}
