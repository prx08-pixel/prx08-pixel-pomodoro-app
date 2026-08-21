import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // GitHub Pages hosts this repo at /prx08-pixel-pomodoro-app/, not the site root.
  base: process.env.GITHUB_ACTIONS ? "/prx08-pixel-pomodoro-app/" : "/",
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    host: true,
    port: 5173,
  },
});
