import { PREFIX } from "../constants";

export default function defineElement(name: string, el: any) {
  try {
    customElements.define(`${PREFIX}-${name}`, el);
  } catch {
    console.warn(`Element with name '${name}' already defined.`);
  }
}
