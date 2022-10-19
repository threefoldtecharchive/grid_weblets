import type {default as VM, Env as Env} from "../types/vm";
import createNetwork from "./createNetwork";
import type {IProfile} from "../types/Profile";
import deploy from "./deploy";
import type {IStore} from "../stores/currentDeployment";
import checkVMExist from "./prepareDeployment";
import {Network} from "../types/kubernetes";
import type FreeFlow from "../types/freeflow";

const {MachineModel, MachinesModel, GatewayNameModel} = window.configs?.grid3_client ?? {};

export default async function deployFreeFlow(data: FreeFlow, profile: IProfile, type: IStore["type"]) {
    const {envs, disks, ...base} = data;
    const {vmName, threeBotUserId, flist, cpu, memory, entrypoint, network, rootFs} = base;
    const {publicIp, planetary, nodeId} = base;

    const vm = new MachineModel();
    vm.name = vmName;
    vm.node_id = nodeId;
    vm.disks = disks;
    vm.memory = memory;
    vm.rootfs_size = rootFs;
    vm.flist = flist;
    vm.entrypoint = entrypoint;
    vm.cpu = cpu;
    vm.planetary = planetary;
    vm.public_ip = publicIp;


    vm.env = createEnvs(envs);

    const vms = new MachinesModel();
    vms.name = vmName;
    vms.network = createNetwork(new Network(network.name, network.ipRange));
    vms.machines = [vm];

    const meta = {
        "type": "vm",
        "name": vmName,
        "projectName": type == "VM" ? "" : type
    };

    vms.metadata = JSON.stringify(meta);

    return deploy(profile, type, vmName, async (grid) => {
        if (type != "VM")
            await checkVMExist(grid, type.toLocaleLowerCase(), vmName);
        return grid.machines
            .deploy(vms)
            .then(() => grid.machines.getObj(vmName))
            .then(async ([vm]) => {
                const GATEWAY_TLS_PASS_TROUGH: boolean = false;

                const gatewayQueryOptions = {
                    gateway: true,
                    farmId: 1,
                };

                console.log('vm')
                console.log(vm)

                const planetary = vm.planetary;


                const gw = new GatewayNameModel();
                gw.name = threeBotUserId

                gw.node_id = +(await grid.capacity.filterNodes(gatewayQueryOptions))[0].nodeId;
                gw.tls_passthrough = GATEWAY_TLS_PASS_TROUGH;

                gw.backends = [`http://[${planetary}]`];

                const nameResult = await grid.gateway.deploy_name(gw);
                console.log('Result of name deploy', nameResult)

                const nameDeploymentResult = await grid.gateway.getObj(gw.name);
                console.log('Result of name deploy', nameDeploymentResult)

                return vm;
            });
    });
}

const createEnvs = (envs: Env[]): { [key: string]: string } => {
    return envs.reduce((res, env) => {
        res[env.key] = env.value;
        return res;
    }, {});
}
