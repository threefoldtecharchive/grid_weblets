import { v4 } from "uuid";
import NodeID from "./nodeId";
import VM from "./vm";
export class QSFSnode{ 
  constructor(
    public nodeId : number= undefined,
    public status : string= undefined,
    
  ) {}
}
export default class QSFS extends VM{
  
    public id = v4();
    public name = "QSFS" + this.id.split("-")[0];
    public qsfsmemory = 1024 * 8;
    public count: number = 3;
    public nodes: number =1;
    public nodeIds : QSFSnode[]=[];
    public password : string= undefined;
    public selection = new NodeID();

  }
