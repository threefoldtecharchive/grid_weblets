import { ISidenavRoute } from "@/types/Sidenav";

export function findInitialPage(sidenav: ISidenavRoute[], to: string): string | null {
  for (const route of sidenav) {
    if (route.to === to) return route.path;
    if (route.children) {
      const path = findInitialPage(route.children, to);
      if (path) return path;
    }
  }

  return null;
}
