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

// export interface IFormField {
//   label: string;
//   placeholder?: string;
//   symbol: string;
//   textarea?: boolean;
//   type?: "text" | "number" | "checkbox" | "password";
//   link?: {
//     url: string;
//     label: string;
//   };
// }

export interface ISelectOption {
  label: string;
  value: string;
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
