import { defineConfig, loadEnv } from "vite";
import {parsePublicEnv} from "./src/utils/parsePublicEnv"
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
 const publicEnv = parsePublicEnv(env)

  return {
    base: "/",
    plugins: [react()],
    build: {
      outDir: "dist",
      emptyOutDir: true,
      rollupOptions: {
        input: "./index.html",
        output: {
          entryFileNames: `assets/[name].[hash].js`,
          chunkFileNames: `assets/[name].[hash].js`,
          assetFileNames: `assets/[name].[hash].[ext]`
        }
      }
    },
    publicDir: "public",
    server: {
      open: true,
      port: +env.VITE_PORT,
    },
    preview: {
      port: +env.VITE_PORT,
    },
    define: {
      'process.env': publicEnv,
    },
  };
});