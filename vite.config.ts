import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import sitemapPlugin from "vite-plugin-sitemap";
import viteCompression from "vite-plugin-compression";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isProduction = mode === "production";

  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [
      react(),
      mode === "development" && componentTagger(),
      sitemapPlugin({
        hostname: "https://www.pechintech.com.br",
        changefreq: "daily",
        priority: 0.8,
        readable: true,
        exclude: ["/admin/*", "/auth", "/auth/*"],
        dynamicRoutes: ["/", "/blog"],
        generateRobotsTxt: false, // Já temos robots.txt manual
      }),
      isProduction &&
        viteCompression({
          algorithm: "gzip",
          ext: ".gz",
        }),
      isProduction &&
        viteCompression({
          algorithm: "brotliCompress",
          ext: ".br",
        }),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      target: "esnext",
      minify: isProduction ? "esbuild" : false,
      cssCodeSplit: true,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ["react", "react-dom", "react-router-dom"],
            supabase: ["@supabase/supabase-js"],
            ui: [
              "@radix-ui/react-dialog",
              "@radix-ui/react-dropdown-menu",
              "@radix-ui/react-popover",
              "@radix-ui/react-tabs",
            ],
          },
        },
      },
      chunkSizeWarningLimit: 1000,
      sourcemap: !isProduction,
    },
    optimizeDeps: {
      include: [
        "react",
        "react-dom",
        "react-router-dom",
        "@supabase/supabase-js",
        "@tanstack/react-query",
      ],
    },
  };
});
