export interface IAction {
  type: "info" | "success" | "warning" | "danger";
  label: string;
  click: (e: Event, index: number) => void;
  disabled?: (index: number) => boolean;
  loading?: (index: number) => boolean;
  show?: (index: number) => boolean;
}
