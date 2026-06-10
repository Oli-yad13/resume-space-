/// <reference types='vitest' />

import { nxViteTsPaths } from "@nx/vite/plugins/nx-tsconfig-paths.plugin";
import react from "@vitejs/plugin-react-swc";
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
  base: "/artboard/",

  cacheDir: "../../node_modules/.vite/artboard",

  build: {
    sourcemap: true,
    emptyOutDir: true,
  },

  server: {
    host: true,
    allowedHosts: ["host.docker.internal"],
    port: 6173,
    fs: { allow: [searchForWorkspaceRoot(process.cwd())] },
  },

  plugins: [nestjsZodStub(), react(), nxViteTsPaths()],

  resolve: {
    alias: {
      "@/artboard/": `${searchForWorkspaceRoot(process.cwd())}/apps/artboard/src/`,
    },
  },
});
