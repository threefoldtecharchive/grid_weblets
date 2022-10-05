import VM from "./vm";
import { v4 } from "uuid";
import validateName, {
  validateEntryPoint,
  validateFlistvalue,
} from '../utils/validateName';

export default class FullVM extends VM {
  public name = `VM${v4().split("-")[0]}`;
  public rootFs = 0;
  public diskSize: number = 50;
  public get valid(): boolean {
    const { name, diskSize, flist, entrypoint, envs, disks } = this;
    return (
      name !== "" &&
      flist !== "" &&
      diskSize >= 15 &&
      validateName(name) === undefined &&
      validateFlistvalue(flist) === undefined &&
      validateEntryPoint(entrypoint) === undefined &&
      envs.reduce((res, env) => res && env.valid, true) &&
      disks.slice(1).reduce((res, disk) => res && disk.valid, true)
    );
  }
}
