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

export type Colors =
  | "primary"
  | "link"
  | "info"
  | "success"
  | "warning"
  | "danger";

export interface IFormField {
  label: string;
  placeholder?: string;
  symbol: string;
  textarea?: boolean;
  type?: "text" | "number" | "checkbox";
}
