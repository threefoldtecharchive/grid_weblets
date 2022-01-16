import type Discourse from "../types/discourse";
import { selectGatewayNode, getUniqueDomainName } from "./gatewayHelpers";
import { Network } from "../types/kubernetes";
import type { IProfile } from "../types/Profile";
import createNetwork from "./createNetwork";
import deploy from "./deploy";
import rootFs from "./rootFs";

const { MachinesModel, DiskModel, GridClient, MachineModel, GatewayNameModel } =
  window.configs?.grid3_client ?? {};

const { HTTPMessageBusClient } = window.configs?.client ?? {};

const DISCOURSE_FLIST =
  "https://hub.grid.tf/rafybenjamin.3bot/threefolddev-discourse-v1.5.flist";

export default async function deployDiscourse(
  data: Discourse,
  profile: IProfile
) {
  const name = data.name;
  const { mnemonics, storeSecret, networkEnv, sshKey } = profile;

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

  const network = createNetwork(new Network(`NW${name}`, "10.200.0.0/16")); // prettier-ignore

  let domainName = await getUniqueDomainName(client, "dc", name);

  let [publicNodeId, nodeDomain] = await selectGatewayNode();
  const domain = `${domainName}.${nodeDomain}`;

  await depoloyDiscourseVM(data, profile, domain, network);

  const discourseInfo = await getDiscourseInfo(client, name);
  const planetaryIP = discourseInfo[0]["planetary"] as string;
  const publicIP = discourseInfo[0]["publicIP"]["ip"].split("/")[0];
  console.log({ discourseInfo });
  console.log({ publicIP });

  try {
    await deployPrefixGateway(
      profile,
      client,
      domainName,
      planetaryIP,
      publicNodeId,
      publicIP
    );
  } catch (error) {
    // rollback peertube deployment if gateway deployment failed
    await client.machines.delete({ name: name });
    throw error;
  }
}

async function depoloyDiscourseVM(
  data: Discourse,
  profile: IProfile,
  domain: string,
  network: any
) {
  const {
    name,
    cpu,
    memory,
    nodeId,
    diskSize,
    smtp,
    developerEmail,
    threepotPRKey,
    resticPassword,
    resticRepository,
    AWSAccessKeyID,
    AWSSecretAccessKey,
    railsEvn,
    flaskSecretKey,
    threebotURL,
    openKYCURL,
    version,
  } = data;

  /* Docker disk */
  const disk = new DiskModel();
  disk.name = "data0";
  disk.size = diskSize;
  disk.mountpoint = "/var/lib/docker";

  const machine = new MachineModel();
  machine.name = name;
  machine.cpu = cpu;
  machine.memory = memory;
  machine.disks = [disk];
  machine.node_id = nodeId;
  machine.public_ip = true;
  machine.planetary = true;
  machine.flist = DISCOURSE_FLIST;
  machine.qsfs_disks = [];
  machine.rootfs_size = rootFs(cpu, memory);
  machine.entrypoint = "/.start_discourse.sh";
  console.log("pub Key", profile.sshKey);
  machine.env = {
    pub_key: profile.sshKey,
    DISCOURSE_SMTP_PASSWORD: smtp.password,
    DISCOURSE_VERSION: version,
    RAILS_ENV: railsEvn,
    DISCOURSE_HOSTNAME: domain,
    DISCOURSE_SMTP_USER_NAME: smtp.userName,
    DISCOURSE_SMTP_ADDRESS: smtp.address,
    DISCOURSE_DEVELOPER_EMAILS: developerEmail,
    DISCOURSE_SMTP_PORT: smtp.port,
    THREEBOT_PRIVATE_KEY: threepotPRKey,
    FLASK_SECRET_KEY: flaskSecretKey,
    THREEBOT_URL: threebotURL,
    OPEN_KYC_URL: openKYCURL,
    RESTIC_REPOSITORY: resticRepository,
    RESTIC_PASSWORD: resticPassword,
    AWS_ACCESS_KEY_ID: AWSAccessKeyID,
    AWS_SECRET_ACCESS_KEY: AWSSecretAccessKey,
    DISCOURSE_SMTP_ENABLE_START_TLS: smtp.enableTLS,
  };
  console.log("env vars", machine.env);
  const machines = new MachinesModel();
  machines.name = name;
  machines.machines = [machine];
  machines.network = network;
  machines.description = "discourse machine/node";

  return deploy(profile, "Discourse", name, (grid) => {
    return grid.machines.deploy(machines);
  });
}

async function getDiscourseInfo(client: any, name: string) {
  const info = await client.machines.getObj(name);
  return info;
}

async function deployPrefixGateway(
  profile: IProfile,
  client: any,
  domainName: string,
  backend: string,
  publicNodeId: number,
  publicIP: string
) {
  // define specs
  const gw = new GatewayNameModel();
  gw.name = domainName;
  gw.node_id = publicNodeId;
  gw.tls_passthrough = false;
  gw.backends = [`http://${publicIP}:80`];

  return deploy(profile, "GatewayName", domainName, (grid) => {
    return grid.gateway.deploy_name(gw);
  });
}