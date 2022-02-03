import VM from "./vm";
import { v4 } from "uuid";

import isValidInteger from "../utils/isValidInteger";

import NodeID from "./nodeId";

export default class Casperlabs extends VM {
    public cpu = 4;
    public memory = 1024 * 4;
    public diskSize = 100;
    public publicIp = true;
    public publicIp6 = true;
    public knownValidator = "";



    public get valid(): boolean {
        const { name, flist, cpu, memory, diskSize, entrypoint, nodeId } = this;
        const { knownValidator } = this;
        const { network, envs, disks } = this;

        return (
            name !== "" &&
            flist !== "" &&
            entrypoint !== "" &&
            isValidInteger(cpu) &&
            isValidInteger(memory) &&
            isValidInteger(nodeId) &&
            network.valid &&
            envs.reduce((res, env) => res && env.valid, true) &&
            disks.reduce((res, disk) => res && disk.valid, true)

        );

    }
}



