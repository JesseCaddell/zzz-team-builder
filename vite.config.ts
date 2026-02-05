import { defineConfig } from "vite";
import electron from "vite-plugin-electron/simple";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    react(),
    electron({
      main: {
        entry: "electron/main.ts",
        vite: {
          build: {
            lib: {
              entry: "electron/main.ts",
              formats: ["cjs"],
              fileName: () => "main.cjs",
            },
            commonjsOptions: {
              ignoreDynamicRequires: true,
            },
            rollupOptions: {
              external: ["better-sqlite3"],
              output: {
                format: "cjs",
                exports: "auto",
              },
            },
          },
        },
      },
      preload: {
        input: "electron/preload.ts",
        vite: {
          build: {
            lib: {
              entry: "electron/preload.ts",
              formats: ["cjs"],
              fileName: () => "preload.cjs",
            },
            rollupOptions: {
              output: { format: "cjs", exports: "auto" },
            },
          },
        },
      },
      renderer: process.env.NODE_ENV === "test" ? undefined : {},
    }),
  ],
});




