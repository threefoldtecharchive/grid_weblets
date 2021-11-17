import { URL } from "../constants";
import yaml from "js-yaml";

export default function loadFile(path: string): Promise<string> {
  const isYaml = path.endsWith(".yaml");
  return fetch(URL + path)
    .then((res) => res.text())
    .then((res) => {
      if (isYaml) {
        return JSON.stringify(yaml.load(res));
      }
      return res;
    })
    .catch(() => `Failed to load file '${path}'`);
}
