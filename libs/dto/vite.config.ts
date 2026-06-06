import { nxViteTsPaths } from "@nx/vite/plugins/nx-tsconfig-paths.plugin";
import { defineConfig } from "vite";

export default defineConfig({
  cacheDir: "../../node_modules/.vite/dto",

  plugins: [nxViteTsPaths()],

  build: {
    lib: {
      entry: "src/index.ts",
      formats: ["es"],
    },
    rollupOptions: {
      external: ["nestjs-zod", "nestjs-zod/dto"],
    },
  },

  test: {
    globals: true,
    environment: "jsdom",
    include: ["src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
  },
});
