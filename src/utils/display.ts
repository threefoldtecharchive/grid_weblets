export function display(active: string, tab: string): string {
  if (active !== tab) return "display: none;";
  return "display: block;";
}
