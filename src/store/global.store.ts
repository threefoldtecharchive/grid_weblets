import { writable } from "svelte/store";
import type { IGlobalOptions } from "../types";

function globalStore() {
  const { subscribe, set } = writable<IGlobalOptions>();

  return {
    subscribe,
    init(options?: IGlobalOptions) {
      let sidenav = !options || options.sidenav === true ? '/configs/sidenav.yaml' : options.sidenav; // prettier-ignore

      set({
        title: options?.title ?? "$title",
        sidenav,
      });
    },
  };
}

export default globalStore();
