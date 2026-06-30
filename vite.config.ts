import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiKey = env.VITE_FOOTBALL_DATA_API_KEY || "";

  return {
    plugins: [
      react(),
      tailwindcss(),
      tsconfigPaths(),
    ],
    server: {
      port: 8080,
      host: true,
      open: true,
      proxy: {
        // Proxies /api/football-data/* → football-data.org, injecting the API key server-side
        "/api/football-data": {
          target: env.VITE_FOOTBALL_DATA_API_URL || "https://api.football-data.org/v4",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/football-data/, ""),
          configure: (proxy) => {
            proxy.on("proxyReq", (proxyReq) => {
              if (apiKey) proxyReq.setHeader("X-Auth-Token", apiKey);
            });
          },
        },
      },
    },
    preview: {
      port: 8080,
    },
  };
});
