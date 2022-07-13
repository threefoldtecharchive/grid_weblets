import type TFhubValidator from "../types/TFhubValidator";
import type { IProfile } from "../types/Profile";
import { Network } from "../types/kubernetes";

import createNetwork from "./createNetwork";
import deploy from "./deploy";
import rootFs from "./rootFs";
import checkVMExist from "./prepareDeployment";
import { configVariables, setStakeAmount, getNetwork } from "../utils/tfhubValidatorConf"

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
        nodeId,
        disks: [{ size }],
        publicIp,
        cpu,
        memory,

        mnemonics,
        stakeAmount,
        ethereumAddress,
        ethereumPrivKey,
        keyName,
        moniker,
        chainId,
        gravityAddress,
        ethereumRpc,
        persistentPeers,
        genesisUrl,
        gas_prices,
        gas_adjustment,
        orchestrator_fees,
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
  vm.flist = "https://hub.grid.tf/tf-official-apps/threefold_hub-latest.flist";
  vm.entrypoint = "/sbin/zinit init";
  vm.env = {
    MNEMONICS: mnemonics,
    STAKE_AMOUNT: setStakeAmount(stakeAmount),
    ETHEREUM_ADDRESS: ethereumAddress,
    ETHEREUM_PRIV_KEY: ethereumPrivKey,
    KEYNAME: keyName,
    MONIKER: moniker,
    CHAIN_ID: chainId,
    GRAVITY_ADDRESS: gravityAddress,
    ETHEREUM_RPC: ethereumRpc || configVariables(getNetwork()).ethereumRpc,
    PERSISTENT_PEERS: persistentPeers,
    GENESIS_URL: genesisUrl,
    GAS_PRICES: gas_prices,
    GAS_ADJUSTMENT: gas_adjustment,
    ORCHESTRATOR_FEES: orchestrator_fees,
    SSH_KEY: profile.sshKey,
  };

  const vms = new MachinesModel();
  vms.name = name;
  vms.network = createNetwork(new Network());
  vms.machines = [vm];

  const metadate = {
    "type":  "vm",  
    "name": name,
    "projectName": "TFhubValidator"
  };
  vms.metadata = JSON.stringify(metadate);


  return deploy(profile, "TFhubValidator", name, async (grid) => {
    await checkVMExist(grid, "tfhubValidator", name);

    return grid.machines
      .deploy(vms)
      .then(() => grid.machines.getObj(name))
      .then(([vm]) => vm);
  });
}
