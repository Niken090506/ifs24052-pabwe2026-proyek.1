import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import process from "process";

function nixbayBackendPlugin() {
  let isStarted = false;
  return {
    name: "vite-plugin-nixbay-backend",
    async configureServer() {
      if (!isStarted) {
        isStarted = true;
        try {
          // Auto-start Express server with Vite
          await import("./server/index.js");
        } catch (e) {
          console.error("Auto-start server notice:", e.message);
        }
      }
    },
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [vue(), tailwindcss(), nixbayBackendPlugin()],
    server: {
      port: Number(env.APP_PORT) || 3000,
      proxy: {
        "/api/v1": {
          target: "http://localhost:8000",
          changeOrigin: true,
        },
        "/uploads": {
          target: "http://localhost:8000",
          changeOrigin: true,
        },
      },
    },
    preview: {
      port: Number(env.APP_PORT) || 3000,
    },
    define: {
      DELCOM_BASEURL: JSON.stringify(
        env.VITE_DELCOM_BASEURL || "/api/v1"
      ),
    },
    test: {
      globals: true,
      environment: "jsdom",
      setupFiles: "./src/setupTests.js",
      coverage: {
        provider: "v8",
        reporter: ["text", "json", "html", "lcov"],
        include: ["src/**/*.{js,vue}"],
        exclude: [
          "src/main.js",
          "src/setupTests.js",
          "src/test-utils.js",
          "**/*.test.{js,jsx}",
          "node_modules/**",
          ".docs/**",
        ],
        thresholds: {
          lines: 100,
          functions: 100,
          branches: 100,
          statements: 100,
        },
      },
    },
  };
});