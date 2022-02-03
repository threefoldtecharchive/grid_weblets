import type { default as Owncloud } from "../types/owncloud";
import type { IProfile } from "../types/Profile";
import deploy from "./deploy";

import { selectGatewayNode, getUniqueDomainName } from "./gatewayHelpers";
import rootFs from "./rootFs";


const { HTTPMessageBusClient } = window.configs?.client ?? {};
const {
    GridClient,
    DiskModel,
    MachineModel,
    MachinesModel,
    GatewayNameModel,
    NetworkModel,
    generateString,
} = window.configs?.grid3_client ?? {};

export default async function deployOwncloud(data: Owncloud, profile: IProfile) {
    const { envs, adminUsername, adminPassword, smtpFromEmail, smtpHost, smtpPort, smtpHostPassword, smtpHostUser, smtpUseTLS, smtpUseSSL, cpu, memory, diskSize, ...base } = data;
    let { name, flist, entrypoint, network: nw } = base;
    const { publicIp, planetary, nodeId } = base;
    const { mnemonics, storeSecret, networkEnv, sshKey } = profile;

    const http = new HTTPMessageBusClient(0, "", "", "");
    const client = new GridClient(
        networkEnv as any,
        mnemonics,
        storeSecret,
        http,
        undefined,
        "tfkvstore" as any
    );

    await client.connect();

    // sub deployments model (vm, disk, net): <type><random_suffix>
    let randomSuffix = generateString(10).toLowerCase();

    // gateway model: <solution-type><twin-id><solution_name>
    let domainName = await getUniqueDomainName(client, "oc", name);

    // Dynamically select node to deploy the gateway
    let [publicNodeId, nodeDomain] = await selectGatewayNode();
    const domain = `${domainName}.${nodeDomain}`;

    // define a network
    const network = new NetworkModel();
    network.name = `net${randomSuffix}`;
    network.ip_range = "10.1.0.0/16";

    // deploy the owncloud
    const deployment = await deployOwncloudVM(
        profile,
        client,
        name,
        network,
        nodeId,
        domain,
        cpu,
        memory,
        diskSize,
        adminUsername,
        adminPassword,
        sshKey,
        smtpFromEmail, 
        smtpHost, 
        smtpPort, 
        smtpHostPassword,
        smtpHostUser,
        smtpUseTLS,
        smtpUseSSL,
        randomSuffix
    );

    // get the info of owncloud deployment
    const owncloudInfo = await getOwncloudInfo(client, name);
    const planetaryIP = owncloudInfo[0]["planetary"];

    try {
        // deploy the gateway
        await deployPrefixGateway(
            profile,
            client,
            domainName,
            planetaryIP,
            publicNodeId
        );
    } catch (error) {
        // rollback owncloud deployment if gateway deployment failed
        await client.machines.delete({ name: name });
        throw error;
    }

    // get the info of the deployed gateway
    const gatewayInfo = await getGatewayInfo(client, domainName);
    const gatewayDomain = gatewayInfo[0]["domain"];
    return { deployment, domain, planetaryIP };
}

async function deployOwncloudVM(
    profile: IProfile,
    client: any,
    name: string,
    network: any,
    nodeId: number,
    domain: string,
    cpu: number,
    memory: number,
    diskSize: number,
    adminUsername: string,
    adminPassword: string,
    sshKey: string,
    smtpFromEmail: string,
    smtpHost: string,
    smtpPort: string,
    smtpHostPassword: string,
    smtpHostUser: string,
    smtpUseTLS: boolean,
    smtpUseSSL: boolean,
    randomSuffix: string,
) {
    // disk
    const disk = new DiskModel();
    disk.name = `disk${randomSuffix}`;
    disk.size = diskSize;
    disk.mountpoint = "/var/lib/docker";

    // vm specs
    const vm = new MachineModel();
    vm.name = `vm${randomSuffix}`;
    vm.node_id = nodeId;
    vm.disks = [disk];
    vm.public_ip = false;
    vm.planetary = true;
    vm.cpu = cpu;
    vm.memory = memory;
    vm.rootfs_size = rootFs(cpu, memory);
    vm.flist =
        "https://hub.grid.tf/samehabouelsaad.3bot/abouelsaad-owncloud-10.9.1.flist";
    vm.entrypoint = "/sbin/zinit init";
    let smtp_secure: string;
    let emailName: string;
    let emailDomain: string;
    if (smtpUseTLS) {
        smtp_secure = "tls";
    } else if (smtpUseSSL) {
        smtp_secure = "ssl";
    } else {
        smtp_secure = "none";
    }
    // check if smtpFromEmail parameter is not empty then extract the name and domain
    if (smtpFromEmail) {
        let email = smtpFromEmail.split("@");
        emailName = email[0];
        emailDomain = email[1];
    }
    vm.env = {
        SSH_KEY: sshKey,
        OWNCLOUD_DOMAIN: domain,
        OWNCLOUD_ADMIN_USERNAME: adminUsername,
        OWNCLOUD_ADMIN_PASSWORD: adminPassword,
        OWNCLOUD_MAIL_SMTP_SECURE: smtp_secure,
        OWNCLOUD_MAIL_DOMAIN: emailDomain,
        OWNCLOUD_MAIL_FROM_ADDRESS: emailName,
        OWNCLOUD_MAIL_SMTP_HOST: smtpHost,
        OWNCLOUD_MAIL_SMTP_PORT: `${smtpPort}`,
        OWNCLOUD_MAIL_SMTP_NAME: smtpHostUser,
        OWNCLOUD_MAIL_SMTP_PASSWORD: smtpHostPassword,
    };

    // vms specs
    const vms = new MachinesModel();
    vms.name = name;
    vms.network = network;
    vms.machines = [vm];

    // deploy
    return deploy(profile, "Owncloud", name, (grid) => {
        return grid.machines
            .deploy(vms)
            .then(() => grid.machines.getObj(name))
            .then(([vm]) => vm);
    });
}

async function deployPrefixGateway(
    profile: IProfile,
    client: any,
    domainName: string,
    backend: string,
    publicNodeId: number
) {
    // define specs
    const gw = new GatewayNameModel();
    gw.name = domainName;
    gw.node_id = publicNodeId;
    gw.tls_passthrough = false;
    gw.backends = [`http://[${backend}]:80`];

    return deploy(profile, "GatewayName", domainName, (grid) => {
        return grid.gateway
            .deploy_name(gw)
            .then(() => grid.gateway.getObj(domainName))
            .then(([gw]) => gw);
    });
}

async function getOwncloudInfo(client: any, name: string) {
    const info = await client.machines.getObj(name);
    return info;
}

async function getGatewayInfo(client: any, name: string) {
    const info = await client.gateway.getObj(name);
    return info;
}
