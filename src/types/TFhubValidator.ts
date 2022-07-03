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
  gas_prices: string;
  gas_adjustment: string;
  orchestrator_fees: string;

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
  gas_prices: string;
  gas_adjustment: string;
  orchestrator_fees: string;

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
    gas_prices,
    gas_adjustment,
    orchestrator_fees,
  }: Partial<ITFHubValidator> = {}) {
    this.name = "VAL" + this.id.split("-")[0];
    this.mnemonics = mnemonics || "";
    this.stakeAmount = stakeAmount || "";
    this.ethereumAddress = ethereumAddress || "";
    this.ethereumPrivKey = ethereumPrivKey || "";
    this.keyName = keyName;
    this.moniker = moniker;
    this.chainId = chainId;
    this.gravityAddress = gravityAddress;
    this.ethereumRpc = ethereumRpc;
    this.persistentPeers = persistentPeers;
    this.genesisUrl = genesisUrl;
    this.nodeId = nodeId;
    this.ssh_key = ssh_key;
    this.gas_prices = gas_prices;
    this.gas_adjustment = gas_adjustment;
    this.orchestrator_fees = orchestrator_fees;
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
