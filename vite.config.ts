import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Same .env the API server reads, so a custom API_PORT reaches the proxy too
  const env = loadEnv(mode, process.cwd(), "");
  return {
  server: {
    host: "::",
    port: 8080,
    proxy: {
      // API server (server/index.ts) in front of Postgres
      "/api": `http://localhost:${env.API_PORT || 3001}`,
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  };
});
