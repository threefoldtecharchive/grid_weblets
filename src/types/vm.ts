import { v4 } from "uuid";
import isValidInteger from "../utils/isValidInteger";
import { Network } from "./kubernetes";

export class Env {
  constructor(
    public id = v4(),
    public key = "SSH_KEY",
    public value = "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQDTwULSsUubOq3VPWL6cdrDvexDmjfznGydFPyaNcn7gAL9lRxwFbCDPMj7MbhNSpxxHV2+/iJPQOTVJu4oc1N7bPP3gBCnF51rPrhTpGCt5pBbTzeyNweanhedkKDsCO2mIEh/92Od5Hg512dX4j7Zw6ipRWYSaepapfyoRnNSriW/s3DH/uewezVtL5EuypMdfNngV/u2KZYWoeiwhrY/yEUykQVUwDysW/xUJNP5o+KSTAvNSJatr3FbuCFuCjBSvageOLHePTeUwu6qjqe+Xs4piF1ByO/6cOJ8bt5Vcx0bAtI8/MPApplUU/JWevsPNApvnA/ntffI+u8DCwgP"
  ) {}

  public get valid(): boolean {
    const { key, value } = this;
    return key !== "" && value !== "";
  }
}

export class Disk {
  constructor(
    public id = v4(),
    public name = "disk_" + id.split("-")[0],
    public size = 50,
    public mountpoint = "/opt/"
  ) {}

  public get valid(): boolean {
    const { name, size, mountpoint } = this;
    return name !== "" && isValidInteger(size) && mountpoint !== "";
  }
}

export default class VM {
  constructor(
    /* Base */
    public id = v4(),
    public name = "vm_" + id.split("-")[0],
    public flist = "https://hub.grid.tf/tf-official-apps/base:latest.flist",
    public cpu = 4,
    public memory = 1024 * 8,
    public entrypoint = "/sbin/zinit init",
    public planetary = true,
    public nodeId = undefined,
    public rootFsSize = 25,

    /* Network */
    public network = new Network(),

    public envs: Env[] = [],
    public disks: Disk[] = [],
    public publicIp = false
  ) {}

  public get valid(): boolean {
    const { name, flist, cpu, memory, entrypoint, nodeId } = this;
    const { rootFsSize, network, envs, disks } = this;
    return (
      name !== "" &&
      flist !== "" &&
      entrypoint !== "" &&
      isValidInteger(cpu) &&
      isValidInteger(memory) &&
      isValidInteger(nodeId) &&
      isValidInteger(rootFsSize) &&
      network.valid &&
      envs.reduce((res, env) => res && env.valid, true) &&
      disks.reduce((res, disk) => res && disk.valid, true)
    );
  }
}
