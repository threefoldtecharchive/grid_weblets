import * as grid3_client from "grid3_client";
import * as client from "ts-rmb-http-client";
import * as buffer from "buffer";
import * as bip39 from "bip39";
import App from "./App.svelte";

(window as any).configs = (window as any).configs || {};
(window as any).configs = {
  ...(window as any).configs,
  grid3_client,
  client,
  buffer,
  bip39,
};

export default new App({ target: document.body });
