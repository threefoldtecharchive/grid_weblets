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
            qsfs.count = count; 
            qsfs.node_ids= nodeIds;
            qsfs.password = secret;
            qsfs.disk_size= filters.hru;
           
    try {
        
       return deploy(profile, "Qvm", qsfs.name, async(grid) =>{  
            
            await checkVMExist(grid, "qvm", name);

            return grid.qsfs_zdbs
            .deploy(qsfs)
            .then(() => grid.qsfs_zdbs.get({name:name}))
            .then( 
                async ([qsfs]) => {
                    return deployVM(vm,profile,"Qvm")
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











