import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(), 
    tailwindcss()
  ],
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    proxy: {
      "/api/v1": {
        target: "http://10.189.24.166:5000",
        changeOrigin: true,
      },
    },
  },
});
