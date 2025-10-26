import { defineConfig } from "vitest/config";

import path from "node:path";
import url from "node:url";

const r = (p: string) => path.resolve(url.fileURLToPath(new URL(".", import.meta.url)), p);

export default defineConfig({
  resolve: {
    alias: {
      "@": r("./")
    }
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    coverage: {
      reporter: ["text", "lcov"]
    }
  }
});
