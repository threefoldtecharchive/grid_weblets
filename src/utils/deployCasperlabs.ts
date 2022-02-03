import type { default as Casperlabs } from "../types/casperlabs";

import type { IProfile } from "../types/Profile";
import deploy from "./deploy";

import { selectGatewayNode, getUniqueDomainName } from "./gatewayHelpers";
import rootFs from "./rootFs";
import createNetwork from "./createNetwork";
import { Network } from "../types/kubernetes";

const { HTTPMessageBusClient } = window.configs?.client ?? {};
const {
  GridClient,
  DiskModel,
  MachineModel,
  MachinesModel,
  GatewayNameModel,
  generateString,
} = window.configs?.grid3_client ?? {};

export default async function deployCasperlabs(data: Casperlabs, profile: IProfile) {
  const { envs, cpu, memory, diskSize, ...base } = data;

  let { name, flist, entrypoint, network: nw } = base;
  const { publicIp, planetary, nodeId } = base;
  const { knownValidator } = base;
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
  let domainName = await getUniqueDomainName(client, "pt", name);

  // Dynamically select node to deploy the gateway
  let [publicNodeId, nodeDomain] = await selectGatewayNode();
  const domain = `${domainName}.${nodeDomain}`;

  // define a network
  const network = createNetwork(new Network(`net${randomSuffix}`, "10.1.0.0/16")); // prettier-ignore

  // deploy the casper labs
  const deployment = await deployCasperlabsVM(
    profile,
    client,
    network,
    nodeId,
    name,
    knownValidator,
    domain,
    cpu,
    memory,
    diskSize,
    sshKey,
    randomSuffix
  );

  // get the info of casperlabs deployment
  const casperlabsInfo = await getCasperlabsInfo(client, name);
  const planetaryIP = casperlabsInfo[0]["planetary"];

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
    // rollback casperlabs deployment if gateway deployment failed
    await client.machines.delete({ name: name });
    throw error;
  }

  // get the info of the deployed gateway
  const gatewayInfo = await getGatewayInfo(client, domainName);
  const gatewayDomain = gatewayInfo[0]["domain"];
  return { deployment, domain, planetaryIP };
}

async function deployCasperlabsVM(
  profile: IProfile,
  client: any,
  network: any,
  nodeId: any,
  name: string,
  knownValidator: string,
  domain: string,
  cpu: number,
  memory: number,
  diskSize: number,
  sshKey: string,
  randomSuffix: string
) {
  // disk
  const disk = new DiskModel();
  disk.name = `disk${randomSuffix}`;
  disk.size = diskSize;
  disk.mountpoint = "/data";

  // vm specs
  const vm = new MachineModel();
  vm.name = `vm${randomSuffix}`;
  vm.node_id = nodeId;
  vm.disks = [disk];
  vm.public_ip = true;
  vm.public_ip6 = true;
  vm.planetary = true;
  vm.cpu = cpu;
  vm.memory = memory;
  vm.rootfs_size = rootFs(cpu, memory);
  vm.flist =
    "https://hub.grid.tf/ranatarek.3bot/ranatrk-casperlabs-dev.flist"; // FIXME
  vm.entrypoint = "/start_casper";
  vm.env = {
    SSH_KEY: sshKey,
    KNOWN_VALIDATOR_IP: knownValidator,
  };

  // vms specs
  const vms = new MachinesModel();
  vms.name = name;
  vms.network = network;
  vms.machines = [vm];

  // deploy
  return deploy(profile, "Casperlabs", name, (grid) => {
    return grid.machines
      .deploy(vms)
      .then(async () => {
        for (const gw of await grid.gateway._list()) {
          try {
            await grid.gateway.getObj(gw);
          }
          catch { }
        }
      })
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

async function getCasperlabsInfo(client: any, name: string) {
  const info = await client.machines.getObj(name);
  return info;
}

async function getGatewayInfo(client: any, name: string) {
  const info = await client.gateway.getObj(name);
  return info;
}
