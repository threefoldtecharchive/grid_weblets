import type QSFS from '../types/qsfs'
import type { IProfile } from "../types/Profile"
import type { IStore } from "../stores/currentDeployment";
import { Network } from '../types/kubernetes'
import createNetwork from './createNetwork'
import type VM from '../types/vm'
import deploy from "./deploy";
import deployVM from './deployVM';
import destroy from "./destroy";


import checkVMExist from './prepareDeployment';
import { GridClient, log, qsfs_zdbs } from 'grid3_client';
import getGrid from './getGrid';


export default function deployQvm(
    vm: VM,
    QSFS: QSFS,
    profile: IProfile,
  //  type: IStore['type']

){
    const {  QSFSZDBSModel,log }= window.configs.grid3_client;
    const{
                name,
                filters,
                count,
                nodeIds,
                secret,
            }= QSFS
            const qsfs= new QSFSZDBSModel();
            qsfs.name = name;
            qsfs.count = count; // 4 zdbs for meta
            qsfs.node_ids= nodeIds;
            qsfs.password = secret;
            qsfs.disk_size= filters.hru;
           
    try {
        
       return deploy(profile, "VM", qsfs.name, async(grid) =>{  
            

            return grid.qsfs_zdbs
            .deploy(qsfs)
            .then(() => grid.qsfs_zdbs.get({name:name}))
            .then( 
                async ([qsfs]) => {
                    const qsfsZdbs = await grid.qsfs_zdbs.getZdbs(name);
                    console.log("===========================qsfs zdbs =================================")
                    console.log(qsfsZdbs)
                    console.log("===========================qsfs groups =================================")
                    console.log(qsfsZdbs.groups)
                    console.log("===========================qsfs meta =================================")
                    console.log(qsfsZdbs.meta)
                    console.log("===========================qsfs  =================================")
                    console.log(await grid.qsfs_zdbs.get({name:name}))
                    return deployVM(vm,profile,"VM")
                    .then((vm)=> vm )
                }
            )
    
        })
        }catch(err){
            getGrid(profile, (grid) => grid, false)
            .then(async (grid)=>{
                await grid.qsfs_zdbs.delete(qsfs)
                throw err;
            })
            
    }

}










// let type: IStore["type"] = "Qvm"
// async function deployQsfs( data: QSFS, profile: IProfile,){
//     const { MachineModel, FilterOptions, QSFSZDBSModel, log, }
                                     
//     = window.configs.grid3_client;
//     console.log("data of qsfs",data)
//     const{
//         name,
//         filters,
//         count,
//         nodeIds,
//         secret,
//     }= data
//     const qsfs= new QSFSZDBSModel();
//     qsfs.name = name;
//     qsfs.count = count+4; // 4 zdbs for meta
//     qsfs.node_ids= nodeIds;
//     qsfs.password = secret;
//     qsfs.disk_size= filters.hru;
//     let grid = await getGrid(profile, (grid) => grid, false);
//     const res = await grid.qsfs_zdbs.deploy(qsfs);
//     log(">>>>>>>>>>>>>>>QSFS backend has been created<<<<<<<<<<<<<<<");
//     log(res);

//     const reslog = await grid.qsfs_zdbs.get(qsfs);
//     log(">>>>>>>>>>>>>>>QSFS backend result<<<<<<<<<<<<<<<");
//     log(reslog);

   
//     // return deploy(profile, "Qvm", name, async (grid) => {
//     //     if (type != "VM") await checkVMExist(grid, type.toLocaleLowerCase(), name);
//     //     return grid.qsfs_zdbs
//     //       .deploy(qsfs)
//     //       .then(() => grid.machines.getObj(name))
//     //       .then(([vm]) => vm);
//     //   });
  

// }
// export async function delete_qsfs(name, profile){
//     let grid = await getGrid(profile, (grid) => grid, false);
//     const r = await grid.qsfs_zdbs.delete({ name: name });
//     log(r);
// }
// export async function get_qsfs(name, profile){
//     let grid = await getGrid(profile, (grid) => grid, false);
//     const reslog = await grid.machines.getObj(name)
//     log(">>>>>>>>>>>>>>>QSFS backend getZDB<<<<<<<<<<<<<<<");
//     log(reslog);

// }
