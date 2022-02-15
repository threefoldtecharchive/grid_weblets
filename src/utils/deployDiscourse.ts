import type Discourse from "../types/discourse";
import { selectGatewayNode, getUniqueDomainName } from "./gatewayHelpers";
import { Network } from "../types/kubernetes";
import type { IProfile } from "../types/Profile";
import createNetwork from "./createNetwork";
import deploy from "./deploy";
import rootFs from "./rootFs";
import destroy from "./destroy";

const {
  generateString,
  MachinesModel,
  DiskModel,
  MachineModel,
  GatewayNameModel,
} = window.configs?.grid3_client ?? {};

export default async function deployDiscourse(
  data: Discourse,
  profile: IProfile
) {
  let domainName = await getUniqueDomainName(
    "client",
    "dc",
    data.name,
    profile,
    "Discourse"
  );

  let [publicNodeId, nodeDomain] = await selectGatewayNode();
  data.domain = `${domainName}.${nodeDomain}`;

  const deploymentInfo = await depoloyDiscourseVM(data, profile);

  const planetaryIP = deploymentInfo["planetary"] as string;

  // const publicIP = deploymentInfo[0]["publicIP"]
  //   ? deploymentInfo[0]["publicIP"]["ip"].split("/")[0]
  //   : "";

  try {
    await deployPrefixGateway(profile, domainName, planetaryIP, publicNodeId);
  } catch (error) {
    // rollback peertube deployment if gateway deployment failed
    await destroy(profile, "Discourse", data.name);
    throw error;
  }

  return { deploymentInfo };
}

async function depoloyDiscourseVM(data: Discourse, profile: IProfile) {
  const {
    name,
    cpu,
    memory,
    nodeId,
    diskSize,
    smtp,
    developerEmail,
    threebotPRKey,
    flaskSecretKey,
    publicIp,
    planetary,
    domain,
  } = data;

  let randomSuffix = generateString(10).toLowerCase();

  const network = createNetwork(new Network(`nw${randomSuffix}`));

  /* Docker disk */
  const disk = new DiskModel();
  disk.name = `disk${randomSuffix}`;
  disk.size = diskSize;
  disk.mountpoint = "/var/lib/docker";

  const machine = new MachineModel();
  machine.name = `vm${randomSuffix}`;
  machine.cpu = cpu;
  machine.memory = memory;
  machine.disks = [disk];
  machine.node_id = nodeId;
  machine.public_ip = publicIp;
  machine.planetary = planetary;
  machine.flist =
    "https://hub.grid.tf/rafybenjamin.3bot/threefolddev-discourse-v4.0.flist";
  machine.qsfs_disks = [];
  machine.rootfs_size = rootFs(cpu, memory);
  machine.entrypoint = "/.start_discourse.sh";
  machine.env = {
    SSH_KEY: profile.sshKey,
    DISCOURSE_HOSTNAME: domain,
    DISCOURSE_DEVELOPER_EMAILS: developerEmail,

    DISCOURSE_SMTP_ADDRESS: smtp.address,
    DISCOURSE_SMTP_PORT: smtp.port,
    DISCOURSE_SMTP_ENABLE_START_TLS: smtp.enableTLS ? "true" : "false",
    DISCOURSE_SMTP_USER_NAME: smtp.userName,
    DISCOURSE_SMTP_PASSWORD: smtp.password,
    // Auto generated env. vars
    THREEBOT_PRIVATE_KEY: threebotPRKey,
    FLASK_SECRET_KEY: flaskSecretKey,
  };
  const machines = new MachinesModel();
  machines.name = name;
  machines.machines = [machine];
  machines.network = network;
  machines.description = "discourse machine/node";

  return deploy(profile, "Discourse", name, async (grid) => {
    // For invalidating the cashed keys in the KV store, getObj check if the key has no deployments. it is deleted.
    await grid.machines.getObj(name);
    return grid.machines
      .deploy(machines)
      .then(() => grid.machines.getObj(name))
      .then(([vm]) => vm);
  });
}

async function deployPrefixGateway(
  profile: IProfile,
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

  return deploy(profile, "GatewayName", domainName, async (grid) => {
    // For invalidating the cashed keys in the KV store, getObj check if the key has no deployments. it is deleted.
    await grid.gateway.getObj(domainName);
    return grid.gateway
      .deploy_name(gw)
      .then(() => grid.gateway.getObj(domainName))
      .then(([gw]) => gw);
  });
}
