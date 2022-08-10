import VM from "./vm";
import { v4 } from "uuid";
import validateName from '../utils/validateName';
import isValidInteger from '../utils/isValidInteger';

export default class FullVM extends VM {
  public name = `VM${v4().split("-")[0]}`;
  public rootFs = 0;
  public diskSize: number = 50;



  public get valid(): boolean {
    const { name, diskSize } = this;
    return (
      name !== "" &&
      diskSize >= 15 &&
      validateName(name) === undefined &&
      isValidInteger(diskSize)
    );
  }
}
