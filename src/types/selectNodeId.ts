import type { ISelectOption } from "./index";

interface IFilters {
  country: string;
  farmName: string;
}
type IUpdateKey = "nodes" | "countries" | "farmNames";

export default class SelectNodeID {
  public nodes: ISelectOption[] = [
    { label: "5", value: 5 },
    { label: "33", value: 33 },
  ];
  public countries: ISelectOption[] = [];
  public farmNames: ISelectOption[] = [];
  public filters: IFilters = {
    country: null,
    farmName: null,
  };

  public update(key: IUpdateKey, values: ISelectOption[]): void {
    this[key] = values;
  }

  // prettier-ignore
  public updateFilter<T extends keyof IFilters>(filter: T, value: IFilters[T]): void {
    this.filters[filter] = value;
  }
}
