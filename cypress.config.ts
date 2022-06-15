import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {

    baseUrl:'https://play.dev.grid.tf',

    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
