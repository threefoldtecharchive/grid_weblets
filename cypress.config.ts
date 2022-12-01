import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "https://play.qa.grid.tf",
    supportFile: false,
  },
});
