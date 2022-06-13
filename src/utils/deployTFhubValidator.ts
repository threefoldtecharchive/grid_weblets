import type TFhubValidator from "../types/TFhubValidator";
import type { IProfile } from "../types/Profile";
import { Network } from "../types/kubernetes";

import createNetwork from "./createNetwork";
import deploy from "./deploy";
import rootFs from "./rootFs";
import checkVMExist from "./prepareDeployment";

function getNetwork() :string {
  const networks = ['test', 'dev', 'qa', 'main'];
  const host = window.location.host;
  let keyword = '';
  let match = networks.includes(
    host.split('.')[1])
    ? keyword = host.split('.')[1]
    : keyword = 'main';
  return match;
}

function defaultEnvVars(host: string){
  const env = {
    main: {
      chainId: "threefold-hub-testnet",
      gravityAddress: "0x7968da29488c498535352b809c158cde2e42497a",
      ethereumRpc: "https://data-seed-prebsc-2-s1.binance.org:8545",
      persistentPeers: "67bd27ada60adce769441d552b420466c2082ecc@tfhub.test.grid.tf:26656",
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
    dev: {
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
    MachineModel,
    MachinesModel,
} = window.configs?.grid3_client ?? {};

export default async function deployTFhubValidator(
    profile: IProfile,
    tfhubValidator: TFhubValidator
) {

  const validatorVm = await _deployTfHubValidator(
      profile, tfhubValidator
    );

  const ip = validatorVm["planetary"] as string;
  return validatorVm;
}

function _deployTfHubValidator(
        profile: IProfile, tfhubValidator: TFhubValidator
    ) {
    const {
        name,
        mnemonics,
        keyName,
        stakeAmount,
        moniker,
        ethereumAddress,
        ethereumPrivKey,
        nodeId,
        cpu,
        memory,
        publicIp,
    } = tfhubValidator;


  const vm = new MachineModel();
  vm.name = name;
  vm.node_id = nodeId;
  vm.disks = [];
  vm.public_ip = publicIp;
  vm.planetary = true;
  vm.cpu = cpu;
  vm.memory = memory;
  vm.rootfs_size = rootFs(cpu, memory);
  vm.flist = "https://hub.grid.tf/ashraf.3bot/ashraffouda-threefold_hub-latest.flist";
  vm.entrypoint = "/sbin/zinit init";
  vm.env = {
    MNEMONICS: mnemonics,
    KEYNAME: keyName,
    STAKE_AMOUNT: stakeAmount,
    MONIKER: moniker,
    CHAIN_ID: defaultEnvVars(getNetwork()).chainId,
    ETHEREUM_ADDRESS: ethereumAddress,
    ETHEREUM_PRIV_KEY: ethereumPrivKey,
    GRAVITY_ADDRESS: defaultEnvVars(getNetwork()).gravityAddress,
    ETHEREUM_RPC: defaultEnvVars(getNetwork()).ethereumRpc,
    PERSISTENT_PEERS: defaultEnvVars(getNetwork()).persistentPeers,
    GENESIS_URL: defaultEnvVars(getNetwork()).genesisUrl,
    SSH_KEY: profile.sshKey,
  };
  console.log(getNetwork());
  console.log(profile.sshKey);
  
  console.log(defaultEnvVars(getNetwork()).genesisUrl);

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
