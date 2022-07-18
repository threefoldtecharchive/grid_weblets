import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {

    baseUrl:'https://play.qa.grid.tf',
    supportFile:false,

    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
