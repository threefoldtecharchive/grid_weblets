import type Discourse from "../types/discourse";
import { selectGatewayNode, getUniqueDomainName } from "./gatewayHelpers";
import { Network } from "../types/kubernetes";
import type { IProfile } from "../types/Profile";
import createNetwork from "./createNetwork";
import deploy from "./deploy";
import rootFs from "./rootFs";
import destroy from "./destroy";
import checkVMExist, { checkGW } from "./prepareDeployment";

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
  let domainName = await getUniqueDomainName(profile, data.name, "discourse");

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
    await destroy(profile, "discourse", data.name);
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
    disks: [{ size }],
    smtp,
    developerEmail,
    threebotPRKey,
    flaskSecretKey,
    domain,
  } = data;

  let randomSuffix = generateString(10).toLowerCase();

  const network = createNetwork(new Network(`nw${randomSuffix}`));

  /* Docker disk */
  const disk = new DiskModel();
  disk.name = `disk${randomSuffix}`;
  disk.size = size;
  disk.mountpoint = "/var/lib/docker";

  const machine = new MachineModel();
  machine.name = name; //`vm${randomSuffix}`;
  machine.cpu = cpu;
  machine.memory = memory;
  machine.disks = [disk];
  machine.node_id = nodeId;
  machine.public_ip = false;
  machine.planetary = true;
  machine.flist =
    "https://hub.grid.tf/tf-official-apps/discourse-v4.0.flist";
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

  const metadate = {
    "type":  "vm",  
    "name": name,
    "projectName": "Discourse"
  };
  machines.metadata = JSON.stringify(metadate);


  return deploy(profile, "Discourse", name, async (grid) => {
    await checkVMExist(grid, "discourse", name);
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

  const metadate = {
    "type":  "gateway",  
    "name": domainName,
    "projectName": "Discourse"
  };
  gw.metadata = JSON.stringify(metadate);

  return deploy(profile, "GatewayName", domainName, async (grid) => {
    await checkGW(grid, domainName, "discourse");
    return grid.gateway
      .deploy_name(gw)
      .then(() => grid.gateway.getObj(domainName))
      .then(([gw]) => gw);
  });
}
