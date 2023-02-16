import * as grid3_client from "grid3_client";
import * as buffer from "buffer";
import * as bip39 from "bip39";
(window as any).configs = (window as any).configs || {};
(window as any).configs = {
  ...(window as any).configs,
  grid3_client,
  buffer,
  bip39,
};

import App from "./App.svelte";

export default new App({ target: document.body });
