import { v4 } from "uuid";
import isValidInteger from "../utils/isValidInteger";
import {
  validateKey,
  validateMemory,
  validateMountPoint,
  validateKeyValue,
} from "../utils/validateName";

export default class QSFS {
    public id = v4();
    public name = "QSFS" + this.id.split("-")[0];
    public disk = 1024 ;
    public cache = 1
    public count: number = 3;
    public nodes: number =1;
    public nodeIds : number[]=[];
    public secret : string;
    public mountpoint: string= `/${this.name}`;
    public filters = {

      hru: Math.ceil(Math.round(this.disk / 1024)*(this.count)/(this.nodes)), 
      /* updater */
      update: (key: string, value: any) => {
        if(key ==="hru"&&this.nodes) {
          this.filters["hru"] = Math.ceil(value*(this.count)/(this.nodes))
          }
        else this.filters[key] = value;
          
    }
  }
  public get valid(): boolean {
    const { name, disk, cache, count, nodes, mountpoint, nodeIds,secret } = this;
    
    return (
      name !== "" &&
      mountpoint !==""&&
      secret !==""&&
      isValidInteger(cache)&&
      isValidInteger(count)&&
      isValidInteger(disk) &&
      isValidInteger(nodes) &&
      nodeIds.length===nodes
    );
  }

}