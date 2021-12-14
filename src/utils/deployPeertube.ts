import type { default as VM } from "../types/vm";
import type { IProfile } from "../types/Profile";

import {
  isValidName,
  checkSuitableName,
  getSuitableGateway,
} from "./getValidGateway";
import { gatewayNodes, getNodeDomain } from "./gatewayNode";

const { HTTPMessageBusClient } = window.configs?.client ?? {};
const {
  GridClient,
  NetworkModel,
  DiskModel,
  MachineModel,
  MachinesModel,
  GatewayNameModel,
  Nodes,
} = window.configs?.grid3_client ?? {};

export let domain, peertubeYggIp, peertubePubIp;

export default async function deployPeertube(data: VM, profile: IProfile) {
  // connect
  const { envs, disks, ...base } = data;
  let { name, flist, cpu, memory, entrypoint, network: nw } = base;
  const { publicIp, planetary, nodeId, rootFsSize } = base;
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

  // Make sure the name is valid
  name = await getSuitableGateway(client, name);
  console.log(name);

  // Gateway node Id and domain
  const gwNodeId = 8;
  const nodes = new Nodes(GridClient.config.graphqlURL, GridClient.config.rmbClient["proxyURL"]); // prettier-ignore
  const gwDomain = await getNodeDomain(nodes, gwNodeId);
  domain = `${name}.${gwDomain}`;
  console.log(domain);

  // // define a network
  const network = new NetworkModel();
  network.name = name + "NW";
  network.ip_range = "10.1.0.0/16";

  // // deploy the peertube
  await deployPeertubeVM(client, network, nodeId, name, domain);

  // // get the info
  const peertubeInfo = await getPeertubeInfo(client, name + "PTVMs");
  peertubePubIp = peertubeInfo[0]["publicIP"]["ip"].split("/")[0];
  peertubeYggIp = peertubeInfo[0]["planetary"];

  // // deploy the gateway
  await deployPrefixGateway(client, name, peertubePubIp, gwNodeId);

  // // // return the info
  const gatewayInfo = await getGatewayInfo(client, name);
  const gatewayDomain = gatewayInfo[0]["domain"];

  // Expected gateway
  console.log(domain);
  // Deployed gateway
  console.log(gatewayDomain);
}

async function deployPeertubeVM(
  client: any,
  net: any,
  nodeId: any,
  name: string,
  domain: string
) {
  // disk
  const disk3 = new DiskModel();
  disk3.name = name + "Data";
  disk3.size = 10;
  disk3.mountpoint = "/data";

  // vm specs
  const vm = new MachineModel();
  vm.name = name + "PTVM";
  vm.node_id = nodeId;
  vm.disks = [disk3];
  vm.public_ip = true;
  vm.planetary = true;
  vm.cpu = 3;
  vm.memory = 1024 * 4;
  vm.rootfs_size = 1;
  vm.flist =
    "https://hub.grid.tf/omarabdul3ziz.3bot/threefoldtech-peertube-v3.0.flist";
  vm.entrypoint = "/usr/local/bin/entrypoint.sh";
  vm.env = {
    SSH_KEY:
      "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQDZnBgLQt77C1suFHsBH5sNdbTxcCCiowDPB+U8h0OsT7onOg/HCYGEguUh9yl5VlacODXSexBhg9LsFTDuO/nBTf/DQVpjqRGQs1QenoGrpaxxaI5Svo5GBLE3Jogva/fhbJtwK9yEgW+1zltO3rTp+sdQ7JFG3uZGnlLSN1U+PCJVzONM2BaAGkQ6XHHuCCiisMlNgWXUzN3T+DjkzHWbXyqPEoK/gSkV20QzWbDRzxM/FJNIOZZh70H+n3QcSl9Q5VTfhc2K1rMNnGRQrl2QHcBsPoO/8dYJxKGt/u9pZI3wkE5C0coYtNvfXIcNj7cSsSJIvCdYYl6x4LkxXhwrOomOwmtZTmJEewe0nhClDU4gMm4s3eET7j2GPe73Ft2OVuF9j+3z0K3jUFQ/2m3HmDDtNVYlB7IOL5479cLRfBBvvQuNpd0p1yBUopxoBureFdqgZYa5887BcUENOKiR58JgF1mZ15g4nnUrdkXqm7KhQgniAp9E68MdsJEg9t0= omar@jarvis",
    PEERTUBE_DB_SUFFIX: "_prod",
    PEERTUBE_DB_USERNAME: "peertube",
    PEERTUBE_DB_PASSWORD: "peertube",
    PEERTUBE_ADMIN_EMAIL: "ashraf.m.fouda@gmail.com",
    PEERTUBE_WEBSERVER_HOSTNAME: domain,
    PEERTUBE_WEBSERVER_PORT: "443",
    PEERTUBE_SMTP_HOSTNAME: "https://app.sendgrid.com",
    PEERTUBE_SMTP_USERNAME: "Threefold",
    PEERTUBE_SMTP_PASSWORD: "%k00@$MtPAKce$$2^$mtp!%x",
  };

  // vms specs
  const vms = new MachinesModel();
  vms.name = name + "PTVMs";
  vms.network = net;
  vms.machines = [vm];

  // deploy
  return client.machines.deploy(vms);
}

async function deployPrefixGateway(
  client: any,
  name: string,
  backend: string,
  gwNodeId: number
) {
  // define specs
  const gw = new GatewayNameModel();
  gw.name = name;
  gw.node_id = gwNodeId;
  gw.tls_passthrough = false;
  gw.backends = [`http://${backend}:9000`];

  window.configs.currentDeploymentStore.deploy("Peertube", name);
  // deploy
  return client.gateway.deploy_name(gw).then((res) => {
    window.configs.baseConfig.updateBalance();
    window.configs.currentDeploymentStore.clear();
    return res;
  });
}

async function getPeertubeInfo(client: any, name: string) {
  const info = await client.machines.getObj(name);
  return info;
}

async function getGatewayInfo(client: any, name: string) {
  const info = await client.gateway.getObj(name);
  return info;
}
