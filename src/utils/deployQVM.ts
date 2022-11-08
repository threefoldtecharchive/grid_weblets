import type QSFS from '../types/qsfs'
import type { IProfile } from "../types/Profile"
import type { IStore } from "../stores/currentDeployment";
import { Network } from '../types/kubernetes'
import createNetwork from './createNetwork'
import type VM from '../types/vm'


import deploy from './deploy'
import checkVMExist from './prepareDeployment';
import { GridClient, qsfs_zdbs } from 'grid3_client';
import getGrid from './getGrid';


export default function deployQvm(
    data: QSFS,
    profile: IProfile,
    vm: VM,

){
    const deploymentInfo = "wait"
    deployQsfs(data, profile)

}
let type: IStore["type"] = "Qvm"
async function deployQsfs( data: QSFS, profile: IProfile,){
    const { MachineModel, FilterOptions, QSFSZDBSModel, log, }
                                     
    = window.configs.grid3_client;
    console.log("data of qsfs",data)
    const{
        name,
        filters,
        count,
        nodeIds,
        secret,
    }= data
    const qsfs= new QSFSZDBSModel();
    qsfs.name = name;
    qsfs.count = count;
    qsfs.node_ids= nodeIds;
    qsfs.password = secret;
    qsfs.disk_size= filters.hru;
    let grid = await getGrid(profile, (grid) => grid, false);
    const res = await grid.qsfs_zdbs.deploy(qsfs);
    log(">>>>>>>>>>>>>>>QSFS backend has been created<<<<<<<<<<<<<<<");
    log(res);

    const reslog = await grid.qsfs_zdbs.get(qsfs);
    log(">>>>>>>>>>>>>>>QSFS backend result<<<<<<<<<<<<<<<");
    log(reslog);

    const r = await grid.qsfs_zdbs.delete({ name: name });
        log(r);
    // return deploy(profile, "Qvm", name, async (grid) => {
    //     if (type != "VM") await checkVMExist(grid, type.toLocaleLowerCase(), name);
    //     return grid.qsfs_zdbs
    //       .deploy(qsfs)
    //       .then(() => grid.machines.getObj(name))
    //       .then(([vm]) => vm);
    //   });
  

}
