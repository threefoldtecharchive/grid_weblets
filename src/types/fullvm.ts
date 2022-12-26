import VM from "./vm";
import { v4 } from "uuid";
import validateName, {
  validateDisk,
  validateDiskName,
  validateEntryPoint,
  validateFlistvalue,
} from "../utils/validateName";
import isValidInteger from "../utils/isValidInteger";
import type { IFormField } from ".";

export default class FullVM extends VM {
  public name = `VM${v4().split("-")[0]}`;
  public rootFs = 0;
  public diskSize = 50;
  public get valid(): boolean {
    const { network, name, diskSize, flist, entrypoint, envs, disks } = this;
    return (
      name !== "" &&
      flist !== "" &&
      diskSize >= 15 &&
      validateName(name) === undefined &&
      validateFlistvalue(flist) === undefined &&
      validateEntryPoint(entrypoint) === undefined &&
      envs.reduce((res, env) => res && env.valid, true) &&
      disks.slice(1).reduce((res, disk) => res && disk.valid, true) &&
      network.valid
    );
  }
}
export class DiskFullVm {
  // prettier-ignore
  public diskFields: IFormField[] = [
    { label: "Name", symbol: "name", placeholder: "Disk Name", type: "text", validator: validateDiskName, invalid:false },
    { label: "Size (GB)", symbol: "size", placeholder: "Disk size in GB", type: "number", validator: validateDisk, invalid: false },
  ]

  constructor(
    public id = v4(),
    public name = "DISK" + id.split("-")[0],
    public size = 50,
    public mountpoint = `/mnt/${id.split("-")[0]}`,
  ) {}

  get _diskFieldsValid(): boolean {
    return this.diskFields.reduce((res, field) => {
      if (field.invalid === undefined) return res;
      return res && !field.invalid;
    }, true);
  }

  public get valid(): boolean {
    const { name, size } = this;

    return name !== "" && isValidInteger(size) && validateDiskName(name) === undefined && this._diskFieldsValid;
  }
}
