import { defineConfig } from "vite";

export default defineConfig({
    root: "./",
    base: "/Russian-phonetics/", // Match your repository name exactly (case-sensitive)
    build: {
        outDir: "./dist",
        rollupOptions: {
            input: "./index.html",
        },
    },
    publicDir: "public",
});
