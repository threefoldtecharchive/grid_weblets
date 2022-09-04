import { v4 } from "uuid";
import VM from "./vm";

export default class Algorand extends VM {
    public id = v4().split("-")[0];
    public name = `AL${this.id}`;
    public cpu = 1;
    public memory = 1024 * 8;
    public diskSize = 50;
    public publicIp = false;

    public get valid(): boolean {
        return this.name !== "";
    }
}