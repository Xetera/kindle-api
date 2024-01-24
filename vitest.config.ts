import { defineConfig } from "vitest/config";

export default defineConfig({
  root: ".",
  test: {
    clearMocks: true,
    setupFiles: ["dotenv/config", "./src/__test__/setup.vitest.ts"],
  },
});
