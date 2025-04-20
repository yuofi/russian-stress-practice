import { defineConfig } from "vite";

export default defineConfig({
    root: "./",
    base: "/russian-stress-practice-/", // Note the trailing dash to match the repo name
    build: {
        outDir: "./dist",
        rollupOptions: {
            input: "./index.html",
        },
    },
    publicDir: "public",
});
