import type TFhubValidator from "../types/TFhubValidator";
import type { IProfile } from "../types/Profile";
import { Network } from "../types/kubernetes";

import createNetwork from "./createNetwork";
import deploy from "./deploy";
import rootFs from "./rootFs";
import checkVMExist from "./prepareDeployment";


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
        chainId,
        ethereumAddress,
        ethereumPrivKey,
        gravityAddress,
        ethereumRpc,
        persistentPeers,
        genesisUrl,
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
    name: name,
    mnemonics: mnemonics,
    keyName: keyName,
    stakeAmount: stakeAmount,
    moniker: moniker,
    chainId: chainId,
    ethereumAddress: ethereumAddress,
    ethereumPrivKey: ethereumPrivKey,
    gravityAddress: gravityAddress,
    ethereumRpc: ethereumRpc,
    persistentPeers: persistentPeers,
    genesisUrl: genesisUrl,
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
