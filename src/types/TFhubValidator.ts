import { v4 } from "uuid";
import NodeID from "./nodeId";
import { Disk } from "./vm";
import isValidInteger from "../utils/isValidInteger";
import { getNetwork, configVariables} from "../utils/tfhubValidatorConf"

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
  gas_prices: string;
  gas_adjustment: string;
  orchestrator_fees: string;
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
  gas_prices: string;
  gas_adjustment: string;
  orchestrator_fees: string;
  ssh_key: string;
  nodeId: number;

  public publicIp = true;
  public planetary = true;
  public cpu = 2;
  public memory = 1024 * 4;
  public disks = [new Disk(undefined, undefined, 20, undefined)];
  constructor({
    mnemonics,
    stakeAmount,
    ethereumAddress,
    ethereumPrivKey,
    ethereumRpc,
    nodeId,
    ssh_key,
  }: Partial<ITFHubValidator> = {}) {
    this.name = "VAL" + this.id.split("-")[0];
    this.mnemonics = mnemonics || "";
    this.stakeAmount = stakeAmount || "";
    this.ethereumAddress = ethereumAddress || "";
    this.ethereumPrivKey = ethereumPrivKey || "";
    this.keyName = v4().split("-")[0];
    this.moniker = v4().split("-")[0];
    this.chainId = configVariables(getNetwork()).chainId;
    this.gravityAddress = configVariables(getNetwork()).gravityAddress;
    this.ethereumRpc = ethereumRpc;
    this.persistentPeers = configVariables(getNetwork()).persistentPeers;
    this.genesisUrl = configVariables(getNetwork()).genesisUrl;
    this.gas_prices = configVariables(getNetwork()).gas_prices;
    this.gas_adjustment = configVariables(getNetwork()).gas_adjustment;
    this.orchestrator_fees = configVariables(getNetwork()).orchestrator_fees;
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
      !isValidInteger(stakeAmount) ||
      ethereumAddress.trim() === "" ||
      ethereumPrivKey.trim() === ""
    );
  }
}
