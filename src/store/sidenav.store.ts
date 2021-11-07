import { writable } from "svelte/store";
import type { ISidenavRoute } from "../types";

interface IState {
  routes: ISidenavRoute[];
  active: string;
}

function createSidenavStore() {
  const { subscribe, update } = writable<IState>({
    routes: [],
    active: "/",
  });

  return {
    subscribe,
    init(routes: ISidenavRoute[]): void {
      return update(function (value) {
        value.routes = routes;
        return value;
      });
    },
    setRoute(route: string): void {
      return update(function (value) {
        value.active = route;
        return value;
      });
    },
  };
}

export default createSidenavStore();
