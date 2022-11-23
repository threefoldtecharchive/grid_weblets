import type QSFS from "../types/qsfs";
import type { IProfile } from "../types/Profile";
import type VM from "../types/vm";
import deploy from "./deploy";
import deployVM from "./deployVM";
import checkVMExist from "./prepareDeployment";
import getGrid from "./getGrid";

export default function deployQvm(vm: VM, QSFS: QSFS, profile: IProfile) {
  const { QSFSZDBSModel } = window.configs.grid3_client;
  const { name, filters, count, nodeIds, secret } = QSFS;
  const qsfs = new QSFSZDBSModel();
  qsfs.name = name;
  qsfs.count = count;
  qsfs.node_ids = nodeIds;
  qsfs.password = secret;
  qsfs.disk_size = filters.hru;
  const metadate = {
    type: "QSFS",
    name: name,
    projectName: `QVM`,
  };
  qsfs.metadata = JSON.stringify(metadate);

  try {
    return deploy(profile, "Qvm", qsfs.name, async grid => {
      //ping qsfs nodes
      qsfs.node_ids.forEach(async node_id => {
        await grid.zos.pingNode({ nodeId: node_id });
      });
      // ping QVM node
      await grid.zos.pingNode({ nodeId: vm.nodeId });
      await checkVMExist(grid, "qvm", name);
      return grid.qsfs_zdbs
        .deploy(qsfs)
        .then(() => grid.qsfs_zdbs.get({ name: name }))
        .then(async ([qsfs]) => {
          return deployVM(vm, profile, "Qvm").then(vm => vm);
        });
    });
  } catch (err) {
    getGrid(profile, grid => grid, false).then(async grid => {
      await grid.qsfs_zdbs.delete(qsfs);
      throw err;
    });
  }
}
