import { v4 } from "uuid";
import NodeID from "./nodeId";
import VM from "./vm";
export default class QSFS {
    public id = v4();
    public name = "QSFS" + this.id.split("-")[0];
    public disk = 1024 ;
    public cache = 1
    public count: number = 3;
    public nodes: number =1;
    public nodeIds : number[]=[];
    public secret : string;
    public filters = {

      hru: Math.ceil(Math.round(this.disk / 1024)*(this.count)/(this.nodes)), 
      /* updater */
      update: (key: string, value: any) => {
        if(key ==="hru"&&this.nodes) {
          this.filters["hru"] = Math.ceil(value*(this.count)/(this.nodes))
          console.log(this.filters["hru"]);
          }
        else this.filters[key] = value;
          
    }
  }

}