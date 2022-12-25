import { v4 } from "uuid";
import isValidInteger from "../utils/isValidInteger";

export default class QSFS {
  public id = v4();
  public name = "QSFS" + this.id.split("-")[0];
  public disk = 1;
  public cache = 1;
  public count = 3;
  public nodes = 1;
  public nodeIds: number[] = [];
  public secret = "";
  public mountpoint = `/${this.name}`;
  public filters = {
    farmName: null,
    hru: Math.ceil((Math.round(this.disk / 1024) * (this.count + 4)) / this.nodes),
    /* updater */
    update: (key: string, value: any) => {
      if (key === "hru" && this.nodes) {
        this.filters["hru"] = Math.ceil((value * (this.count + 4)) / this.nodes);
      } else this.filters[key] = value;
    },
  };
  public get valid(): boolean {
    const { name, disk, cache, count, nodes, mountpoint, nodeIds, secret } = this;

    return (
      name !== "" &&
      mountpoint !== "" &&
      secret !== "" &&
      isValidInteger(cache) &&
      isValidInteger(count) &&
      isValidInteger(disk) &&
      isValidInteger(nodes) &&
      nodeIds.length === nodes
    );
  }
}
