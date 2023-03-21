import type { IStore } from "./currentDeployment";

export const solutionList: {
  [key in IStore["type"]]?: string;
} = {
  Peertube: "pt",
  Funkwhale: "fw",
  Taiga: "tg",
  Discourse: "dc",
  Owncloud: "oc",
  Mattermost: "mm",
  Mastodon: "md",
  TFhubValidator: "tfvalidator",
  Casperlabs: "cl",
  Presearch: "ps",
  CapRover: "cp",
  Kubernetes: "k8s",
  Machines: "vm",
  VM: "vm",
  NodePilot: "np",
  Fullvm: "fvm",
  Subsquid: "ss",
  Algorand: "al",
  Qvm: "qvm",
  Umbrel: "um",
  Wordpress: "wp",
};
