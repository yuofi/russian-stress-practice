import { defineConfig } from "vite";

export default defineConfig({
    base: "/russian-stress-practice/", // Remove the trailing dash
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
        open: true
    }
});