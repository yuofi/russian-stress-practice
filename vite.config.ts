import { defineConfig } from "vite";

export default defineConfig({
    root: "./",
    base: "/russian-stress-practice/",
    build: {
        outDir: "./dist",
        rollupOptions: {
            input: "./index.html",
        },
    },
});
