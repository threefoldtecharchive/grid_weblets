import type { IStore } from "./../stores/currentDeployment";
export interface IGlobalOptions {
  title?: string;
  sidenav?: string | boolean;
}

export interface ISidenavRoute {
  label: string;
  path?: string;
  to?: string;
  disabled?: boolean;
  children?: ISidenavRoute[];
}

export type Colors = "primary" | "link" | "info" | "success" | "warning" | "danger";

export interface ISelectOption {
  label: string;
  value: string | number;
  selected?: boolean;
  disabled?: boolean;
}

export interface IFormField {
  type: "text" | "number" | "password" | "textarea" | "checkbox" | "select";
  label?: string;
  symbol: string;
  tooltip?: string;
  placeholder?: string;
  options?: ISelectOption[];
  disabled?: boolean;
  error?: string | void;
  validator?: (value: string | number | boolean) => string | void;
  invalid?: boolean;
  min?: string | number;
  max?: string | number;
  loading?: boolean;
  class?: string;
}

export interface IFlist {
  name: string;
  url: string;
  entryPoint: string;
}

export interface ITab {
  label: string;
  value: string;
  removable?: boolean;
}

export interface DeploymentTab {
  label: string;
  value: IStore["type"];
}

export type Packages = "Minimum" | "Standard" | "Recommended" | "Custom";
export interface IPackage {
  name: Packages;
  cpu: number;
  memory: number;
  diskSize: number;
}

export class SelectCapacityUpdate {
  selectedPackage: Packages = "Minimum";
  package: IPackage = undefined;
  invalid = true;
}
