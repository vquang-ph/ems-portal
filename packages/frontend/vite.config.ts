import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const envDir = path.resolve(__dirname, "../../");
  const env = loadEnv(mode, envDir, "APP_FRONTEND_PORT");

  return {
    envPrefix: ["APP_FRONTEND", "APP_ENVIRONMENT", "APP_BACKEND_URL"],
    plugins: [
      tailwindcss(),
      tanstackRouter({
        target: "react",
        autoCodeSplitting: true,
      }),
      react(),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      port: parseInt(env.APP_FRONTEND_PORT) || 3001,
    },
    test: {
      environment: "jsdom",
      globals: true,
      setupFiles: "./src/test/setup.ts",
      css: true,
      coverage: {
        provider: "v8",
        reporter: ["text", "html", "lcov", "json-summary", "json"],
        reportsDirectory: "./coverage",
        exclude: [
          "**/*.d.ts",
          "**/src/test/**",
          "**/node_modules/**",
          "**/dist/**",
          // Global test setup
          "src/test/**",

          // Module-level tests
          "src/modules/**/test/**",

          // Shadcn UI components
          "src/components/ui/**",
        ],
      },
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
        perFile: true,
      },
    },
  };
});
