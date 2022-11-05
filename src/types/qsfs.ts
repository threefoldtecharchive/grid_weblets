import { v4 } from "uuid";
import NodeID from "./nodeId";
export class QSFSnode { 
  constructor(
    public nodeId : number= undefined,
    public status : string= undefined,
    
  ) {}
}
export default class QSFS{
  constructor(
    public id = v4(),
    public name = "VM" + id.split("-")[0],
    public memory = 1024 * 8,
    public count: number = 3,
    public nodeIds : QSFSnode[]=[],
    public password : string= undefined
  ){}
  }
