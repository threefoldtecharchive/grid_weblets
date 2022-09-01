import type Algorand from "../types/algorand";
import type { IProfile } from "../types/Profile";

import { Network } from "../types/kubernetes";
import createNetwork from "./createNetwork";

import rootFs from "./rootFs";
import deploy from "./deploy";
import checkVMExist from "./prepareDeployment";

const { MachinesModel, DiskModel, GridClient, MachineModel, generateString } =
    window.configs?.grid3_client ?? {};

export default async function deployAlgorand(
    data: Algorand,
    profile: IProfile
) {
    const deploymentInfo = await depoloyAlgorandVM(data, profile);
    return { deploymentInfo };
}

async function depoloyAlgorandVM(data: Algorand, profile: IProfile) {
    const {
        name,
        cpu,
        memory,
        nodeId,
        diskSize,
        publicIp,
        planetary,
    } = data;

    // sub deployments model (vm, disk, net): <type><random_suffix>
    let randomSuffix = generateString(10).toLowerCase();

    // Private network
    const network = createNetwork(
        new Network(`nw${randomSuffix}`, "10.200.0.0/16")
    );

    // Docker disk
    const disk = new DiskModel();
    disk.name = `disk${randomSuffix}`;
    disk.size = diskSize;
    disk.mountpoint = "/var/lib/docker";

    // Machine specs
    const machine = new MachineModel();
    machine.name = name; //`vm${randomSuffix}`;
    machine.cpu = cpu;
    machine.memory = memory;
    machine.disks = [disk];
    machine.node_id = nodeId;
    machine.public_ip = publicIp;
    machine.planetary = planetary;
    machine.flist =
        "https://hub.grid.tf/omarabdulaziz.3bot/threefolddev-algorand-0.1.flist";
    machine.qsfs_disks = [];
    machine.rootfs_size = rootFs(cpu, memory);
    machine.entrypoint = "/sbin/zinit init";
    machine.env = {
        SSH_KEY: profile.sshKey,
    };

    // Machines specs
    const machines = new MachinesModel();
    machines.name = name;
    machines.machines = [machine];
    machines.network = network;
    machines.description = "Algorand node";

    const metadate = {
        "type": "vm",
        "name": name,
        "projectName": "Algorand"
    };
    machines.metadata = JSON.stringify(metadate);

    // Deploy
    return deploy(profile, "Algorand", name, async (grid) => {
        await checkVMExist(grid, "algorand", name);

        return grid.machines
            .deploy(machines)
            .then(() => grid.machines.getObj(name))
            .then(([vm]) => vm);
    });
}