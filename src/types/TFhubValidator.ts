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
  ssh_key;
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
    name,
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
    this.name = "TFhub" + name; 
    this.mnemonics = mnemonics || "<MNEMONICS>";
    this.keyName = keyName || "val1";
    this.stakeAmount = stakeAmount || "10000000TFT";
    this.moniker = moniker || "moniker";
    this.chainId = chainId || "threefold-hub";
    this.ethereumAddress = ethereumAddress || "<Binance Address>";
    this.ethereumPrivKey = ethereumPrivKey || "<Binance Address private key>";
    this.gravityAddress = gravityAddress || "0x7968da29488c498535352b809c158cde2e42497a";
    this.ethereumRpc = ethereumRpc || "https://data-seed-prebsc-2-s1.binance.org:8545";
    this.persistentPeers = persistentPeers || "f61888631ea1914830688af0429e5630d2951202@185.206.122.156:26656";
    this.genesisUrl = genesisUrl || "https://gist.githubusercontent.com/ashraffouda/1e494d95ad60ed8f72805c47a0493da7/raw/8ce5ea26ee3d6fa6eaee55bf9089f53b313e681b/genesis.json";
    this.nodeId = nodeId;
    this.ssh_key = ssh_key;
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
