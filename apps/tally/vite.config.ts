import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Plugin } from "vite";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

/**
 * Serve the isolated Carbon document for /prototype-carbon and nested paths.
 * Keeps Carbon CSS out of the main SPA (index.html → main.tsx).
 */
function prototypeCarbonSpa(): Plugin {
  return {
    name: "prototype-carbon-spa",
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        const raw = req.url?.split("?")[0] ?? "";
        const isCarbonNav =
          raw === "/prototype-carbon" ||
          raw === "/prototype-carbon/" ||
          (/^\/prototype-carbon\//.test(raw) && !path.extname(raw));
        if (isCarbonNav) {
          req.url = "/prototype-carbon.html";
        }
        next();
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, _res, next) => {
        const raw = req.url?.split("?")[0] ?? "";
        const isCarbonNav =
          raw === "/prototype-carbon" ||
          raw === "/prototype-carbon/" ||
          (/^\/prototype-carbon\//.test(raw) && !path.extname(raw));
        if (isCarbonNav) {
          req.url = "/prototype-carbon.html";
        }
        next();
      });
    },
  };
}

export default defineConfig({
  // Tailwind must run before Vite's CSS postcss-import resolves bare @import "tailwindcss"
  plugins: [tailwindcss(), react(), prototypeCarbonSpa()],
  resolve: {
    alias: {
      // ESM-safe root (package.json "type": "module") — do not rely on __dirname alone
      "@": path.resolve(rootDir, "./src"),
      "@notion-icons": path.resolve(rootDir, "./src/assets/notion-icons"),
    },
  },
  assetsInclude: ["**/*.svg"],
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(rootDir, "index.html"),
        carbon: path.resolve(rootDir, "prototype-carbon.html"),
      },
    },
  },
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      // Enrichment trigger Run → scanner Indeed (uvicorn on :8000)
      "/api/scanner": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api\/scanner/, ""),
      },
    },
  },
});
