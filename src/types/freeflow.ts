import { v4 } from "uuid";
import { validateKey, validateKeyValue } from "../utils/validateName";
import { Network } from "./kubernetes";
import NodeID from "./nodeId";
import { Disk } from "./vm";

const { generateString } = window.configs.grid3_client;

const randomSuffix: string = generateString(10).toLowerCase();

const NETWORK_NAME: string = `net${randomSuffix}`;
const IP_RANGE: string = "10.249.0.0/16";

const DISK_NAME: string = "disk";
const DISK_SIZE: number = 50;
const DISK_MOUNT_POINT: string = "/disk";

const VM_USE_PLANETARY: boolean = true;
const VM_USE_PUBLIC_IP: boolean = false;
const VM_CPU_COUNT: number = 1;
const VM_MEMORY_COUNT: number = 1024 * 2;
const VM_ROOT_FS_SIZE: number = 0;
const VM_ENTRY_POINT: string = "/sbin/zinit init";
const VM_FLIST =
  "https://hub.grid.tf/lennertapp2.3bot/threefoldjimber-freeflow-ssh-latest.flist";
const VM_ROOT_FS_EDITABLE = false;

export class Env {
  constructor(public id = v4(), public key = "", public value = "") {}

  public get valid(): boolean {
    const { key, value } = this;
    return (
      key !== "" &&
      value !== "" &&
      validateKey(key) === undefined &&
      validateKeyValue(value) === undefined
    );
  }
}

export default class FreeFlow {
  constructor(
    public envs: Env[] = [],
    public vmName = "FF" + v4().split("-")[0],
    public id = v4(),
    public threeBotUserId = "",
    public flist = VM_FLIST,
    public pkg = "",
    public cpu = VM_CPU_COUNT,
    public disks: Disk[] = [
      new Disk(v4(), DISK_NAME, DISK_SIZE, DISK_MOUNT_POINT),
    ],
    public memory = VM_MEMORY_COUNT,
    public entrypoint = VM_ENTRY_POINT,
    public planetary = VM_USE_PLANETARY,
    public nodeId: number = null,
    public network = new Network(NETWORK_NAME, IP_RANGE),
    public publicIp = VM_USE_PUBLIC_IP,
    public selection = new NodeID(),
    public rootFs = VM_ROOT_FS_SIZE,
    public rootFsEditable = VM_ROOT_FS_EDITABLE
  ) {}
}
