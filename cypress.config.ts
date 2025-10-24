import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:4000", // поменяй, если у тебя другой порт
    supportFile: "cypress/support/e2e.ts",
    setupNodeEvents(_on, _config) {},
  },
  video: false,
  fixturesFolder: "cypress/fixtures",
  screenshotsFolder: "cypress/screenshots",
});
