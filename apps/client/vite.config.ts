/// <reference types='vitest' />

import { lingui } from "@lingui/vite-plugin";
import { nxViteTsPaths } from "@nx/vite/plugins/nx-tsconfig-paths.plugin";
import react from "@vitejs/plugin-react";
import { defineConfig, searchForWorkspaceRoot, type Plugin } from "vite";

// Plugin to stub out nestjs-zod for browser compatibility
const nestjsZodStub = (): Plugin => ({
  name: "nestjs-zod-stub",
  enforce: "pre",
  resolveId(id) {
    if (id === "nestjs-zod" || id === "nestjs-zod/dto") {
      return "\0" + id;
    }
    return null;
  },
  load(id) {
    if (id === "\0nestjs-zod" || id === "\0nestjs-zod/dto") {
      return `export const createZodDto = (schema) => class { constructor() {} };`;
    }
    return null;
  },
});

export default defineConfig({
  cacheDir: "../../node_modules/.vite/client",

  build: {
    sourcemap: true,
    emptyOutDir: true,
  },

  define: {
    appVersion: JSON.stringify(process.env.npm_package_version),
  },

  server: {
    host: true,
    port: 5173,
    fs: { allow: [searchForWorkspaceRoot(process.cwd())] },
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        secure: false,
        ws: true,
      },
      "/artboard": {
        target: "http://localhost:6173",
        changeOrigin: true,
        secure: false,
      },
    },
  },

  optimizeDeps: {
    esbuildOptions: {
      loader: {
        ".po": "text",
      },
    },
  },

  plugins: [
    nestjsZodStub(),
    react({
      babel: {
        plugins: ["macros"],
      },
    }),
    lingui(),
    nxViteTsPaths(),
  ],

  test: {
    globals: true,
    environment: "jsdom",
    include: ["src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
  },

  resolve: {
    alias: {
      "@/client/": `${searchForWorkspaceRoot(process.cwd())}/apps/client/src/`,
    },
  },
});
