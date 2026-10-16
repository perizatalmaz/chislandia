import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Все запросы /api перенаправляются на сервер с базой данных (порт 3001)
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
    proxy: {
      "/api": "http://localhost:3001",
    },
  },
});
