import { use, parse } from "marked";
import fm from "front-matter";

/* Config Default markdown here */
use({
  renderer: {
    heading(txt, l) {
      return `<h${l} class="is-size-${l}">${txt}</h${l}>`;
    },
  },
});

export default function markdownParser(md: string) {
  const { attributes, body } = fm(md);
  const html = parse(body);
  return { attributes, html };
}
