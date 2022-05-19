export type ISidenav = ISidenavLabelRoute[];

export interface ISidenavLabelRoute {
  label: string;
  children: ISidenavRoute[];
}

export interface ISidenavRoute {
  label: string;
  to: string;
  path: string;
  children?: ISidenavRoute[];
}
