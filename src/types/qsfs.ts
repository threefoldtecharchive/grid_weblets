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
    public qName = "QSFS" + this.id.split("-")[0];
    public qMemory = 1024 * 8;
    public qCount: number = 3;
    public nodes: number =1;
    public qNodeIds : number[]=[];
    public qPassword : string= undefined;
    public qSelection = new NodeID();
    public filters = {
      // boolean
      publicIPs: null, // -

      // string
      country: null,
      farmName: null, // *

      // number
      cru: null, // *
      // mru: (this.qCount * this.memory)/this.nodes, // *
      mru: null,
      sru: null, // *

      /* updater */
      update: (key: string, value: any) => {
        this.filters[key] = value;
        // this.filters["mru"]=(this.qCount * this.memory)/this.nodes
      },
    }
  }
