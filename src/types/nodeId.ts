import type { ISelectOption } from "./index";

export default class NodeID {
  constructor(
    public type: "automatic" | "manual" = null,
    public filters = {
      // boolean
      publicIPs: null, // -

      // string
      country: null,
      farmName: null, // *

      // number
      cru: null, // *
      mru: null, // *
      sru: null, // *

      /* updater */
      update: (key: string, value: any) => {
        this.filters[key] = value;
      },
    },
    public nodes: ISelectOption[] = [],
  ) {}
}
