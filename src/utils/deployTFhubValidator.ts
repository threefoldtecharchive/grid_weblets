import type TFhubValidator from "../types/TFhubValidator";
import { v4 } from "uuid";
import type { IProfile } from "../types/Profile";
import { Network } from "../types/kubernetes";

import createNetwork from "./createNetwork";
import deploy from "./deploy";
import rootFs from "./rootFs";
import checkVMExist from "./prepareDeployment";

function getNetwork() :string {
  const networks = ['dev', 'qa', 'test', 'main'];
  const host = window.location.host;
  let netWork = '';
  networks.includes(
    host.split('.')[1])
    ? netWork = host.split('.')[1]
    : netWork = 'main';
  return netWork;
}

function defaultEnvVars(host: string){
  // Replace dev with main when you deploying the validator on localhost. 
  const env = {
    dev: {
      chainId: "threefold-hub-testnet",
      gravityAddress: "0x7968da29488c498535352b809c158cde2e42497a",
      ethereumRpc: "https://data-seed-prebsc-2-s1.binance.org:8545",
      persistentPeers: "67bd27ada60adce769441d552b420466c2082ecc@185.206.122.141:26656",
      genesisUrl: "https://gist.githubusercontent.com/OmarElawady/de4b18f77835a86581e5824ca954d646/raw/8b5052408fcd0c7deab06bd4b4b9d0236b5b1e6c/genesis.json",
    },
    qa: {
      chainId: "",
      gravityAddress: "",
      ethereumRpc: "",
      persistentPeers: "",
      genesisUrl: "",
    },
    test: {
      chainId: "",
      gravityAddress: "",
      ethereumRpc: "",
      persistentPeers: "",
      genesisUrl: "",
    },
    main: {
      chainId: "",
      gravityAddress: "",
      ethereumRpc: "",
      persistentPeers: "",
      genesisUrl: "",
    },
  }
  return env[host];
}

const {
    DiskModel,
    MachineModel,
    MachinesModel,
    generateString,
} = window.configs?.grid3_client ?? {};

export default async function deployTFhubValidator(
    profile: IProfile,
    tfhubValidator: TFhubValidator
) {

  const validatorVm = await _deployTfHubValidator(
      profile, tfhubValidator
    );

  return validatorVm;
}

function _deployTfHubValidator(
        profile: IProfile, tfhubValidator: TFhubValidator
    ) {
    const {
        name,
        mnemonics,
        stakeAmount,
        ethereumAddress,
        ethereumPrivKey,
        nodeId,
        cpu,
        memory,
        publicIp,
        disks: [{ size }],
    } = tfhubValidator;

  let randomSuffix = generateString(10).toLowerCase();
  const vm = new MachineModel();
  const disk = new DiskModel();

  disk.name = `disk${randomSuffix}`;
  disk.size = size;
  disk.mountpoint = `/root/.threefold_hub`;

  vm.name = name;
  vm.node_id = nodeId;
  vm.disks = [disk];
  vm.public_ip = publicIp;
  vm.planetary = true;
  vm.cpu = cpu;
  vm.memory = memory;
  vm.rootfs_size = rootFs(cpu, memory);
  vm.flist = "https://hub.grid.tf/ashraf.3bot/ashraffouda-threefold_hub-latest.flist";
  vm.entrypoint = "/sbin/zinit init";
  vm.env = {
    MNEMONICS: mnemonics,
    STAKE_AMOUNT: stakeAmount,
    ETHEREUM_ADDRESS: ethereumAddress,
    ETHEREUM_PRIV_KEY: ethereumPrivKey,
    KEYNAME: v4().split("-")[0],
    MONIKER: v4().split("-")[0],
    CHAIN_ID: defaultEnvVars(getNetwork()).chainId,
    GRAVITY_ADDRESS: defaultEnvVars(getNetwork()).gravityAddress,
    ETHEREUM_RPC: defaultEnvVars(getNetwork()).ethereumRpc,
    PERSISTENT_PEERS: defaultEnvVars(getNetwork()).persistentPeers,
    GENESIS_URL: defaultEnvVars(getNetwork()).genesisUrl,
    SSH_KEY: profile.sshKey,
  };

  const vms = new MachinesModel();
  vms.name = name;
  vms.network = createNetwork(new Network());
  vms.machines = [vm];

  return deploy(profile, "TFhubValidator", name, async (grid) => {
    await checkVMExist(grid, "tfhubValidator", name);

    return grid.machines
      .deploy(vms)
      .then(() => grid.machines.getObj(name))
      .then(([vm]) => vm);
  });
}
