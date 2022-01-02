import type { ISelectOption } from "./index";

export default class SelectNodeID {
  public nodes: ISelectOption[] = [];

  public update(key: "nodes", values: ISelectOption[]): void {
    this[key] = values;
  }
}
