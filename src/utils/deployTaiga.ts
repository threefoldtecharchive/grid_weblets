import type { default as VM } from "../types/vm";
import type { IProfile } from "../types/Profile";
import deploy from "./deploy";

import { selectGatewayNode, getUniqueDomainName } from "./gatewayHelpers";
import rootFs from "./rootFs";

const { HTTPMessageBusClient } = window.configs?.client ?? {};
const {
  DiskModel,
  MachineModel,
  MachinesModel,
  GridClient,
  GatewayNameModel,
  NetworkModel,
  generateString,
} = window.configs?.grid3_client ?? {};

export default async function deployTaiga(data: VM, profile: IProfile) {
  const { envs, disks, username, email, password, ...base } = data;
  let { name, flist, cpu, memory, entrypoint, network: nw } = base;
  const { publicIp, planetary, nodeId } = base;
  const { mnemonics, storeSecret, networkEnv } = profile;

  const http = new HTTPMessageBusClient(0, "");
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
  let domainName = await getUniqueDomainName(client, "tg", name);

  // Dynamically select node to deploy the gateway
  let [publicNodeId, nodeDomain] = await selectGatewayNode();
  const domain = `${domainName}.${nodeDomain}`;

  // define network
  const network = new NetworkModel();
  network.name = `net${randomSuffix}`;
  network.ip_range = "10.1.0.0/16";

  await deployTaigaVM(
    profile,
    client,
    name,
    network,
    nodeId,
    domain,
    randomSuffix,
  );

  const info = await getTaigaInfo(client, name);
  const planetaryIP = info[0]["planetary"];

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
    // rollback the FunkwhaleVM if the gateway fails to deploy
    await client.machines.delete({ name: name });
    throw error;
  }

  const gatewayInfo = await getGatewayInfo(client, domainName);
  return { domain, planetaryIP };
}

async function deployTaigaVM(
  profile: IProfile,
  client: any,
  name: string,
  network: any,
  nodeId: number,
  domain: string,
  randomSuffix: string,
) {
  const disk = new DiskModel();
  disk.name = `disk${randomSuffix}`;
  disk.size = 10;
  disk.mountpoint = "/data";

  const vm = new MachineModel();
  vm.name = `vm${randomSuffix}`;
  vm.node_id = nodeId;
  vm.disks = [disk];
  vm.public_ip = false;
  vm.planetary = true;
  vm.cpu = 4;
  vm.memory = 1024 * 8;
  vm.rootfs_size = rootFs(4, 8 * 1024);
  vm.flist =
    "https://hub.grid.tf/samehabouelsaad.3bot/abouelsaad-taiga-test.flist";
  vm.entrypoint = "/sbin/zinit init";
  vm.env = {
    DOMAIN_NAME: domain,
    SSH_KEY: "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQDsX9pdO2K6sjCbxzrBdc+o91L/AOGzI31Slcp1ZGpjpHs/lhS2O1sogVdbCgTOkxRKMkuaAkvcqrMwPBmfwhNVITFqKT7S+ZcWy26FInkjv7geWwgHaDu43eXfor6UdhEJg2sj/A61V2yQK1N+nTeqQqZOu0uZASfLbQjffO3lrCRKDWkSwmSHbqRF1+O5wEQh4ItH1VQhNoK7PfnY63/+DKZ0i4lbSbqUJ9BGjryOODSlK9+1EvemptSft58CaQRwlT247EfKFwKpuM0mbuoKA2SxEfEaoTTYg41GUGc4uH2nYUMMBIyKBe0FU+Alli433EzQA2LcJiELreLb4y5ZzBULoOVEEhFLVLEGTyUKYQ0nGMH9cAn6/5BijQJXLa7a/O1dE1ZLKL6B9PJfqyZhK7tlqDEb8NCxb2yv3OiC9B7rftLlelWXZEc/jVw8CgdmAJ9sD1ktCHuBFi7TPQTHdE6bcze22vYJJ86r4IuxgZJ3YKNCiKSWyDt0KFfq9Zs= ahmed@Ahmed-Samir"
  };

  const vms = new MachinesModel();
  vms.name = name;
  vms.network = network;
  vms.machines = [vm];

  return deploy(profile, "VM", name, (grid) => {
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
  const gw = new GatewayNameModel();
  gw.name = domainName;
  gw.node_id = publicNodeId;
  gw.tls_passthrough = false;
  gw.backends = [`http://[${backend}]:9000/`, `ws://[${backend}]:9000/`];

  return deploy(profile, "GatewayName", domainName, (grid) => {
    return grid.gateway
      .deploy_name(gw)
      .then(() => grid.gateway.getObj(domainName))
      .then(([gw]) => gw);
  });
}

async function getTaigaInfo(client: any, name: string) {
  const info = await client.machines.getObj(name);
  return info;
}

async function getGatewayInfo(client: any, name: string) {
  const info = await client.gateway.getObj(name);
  return info;
}
