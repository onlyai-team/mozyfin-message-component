import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { defineConfig } from "vite";
import cssInjectedByJs from "vite-plugin-css-injected-by-js";
import dts from "vite-plugin-dts";

const EXTERNAL_PACKAGES = [
  "react",
  "react-dom",
  "echarts",
  "katex",
  "react-markdown",
  "rehype-katex",
  "rehype-raw",
  "remark-gfm",
  "remark-math",
  "lucide-react",
  "@radix-ui/react-hover-card",
  "@radix-ui/react-slot",
  "class-variance-authority",
  "clsx",
  "tailwind-merge",
  // transitive markdown/rehype/remark deps
  "unified",
  "remark",
  "rehype",
  "vfile",
  "hast",
  "mdast",
  "unist",
];

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    cssInjectedByJs(),
    dts({
      include: ["src"],
      insertTypesEntry: true,
    }),
  ],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "MozyfinMessageComponent",
      formats: ["es", "cjs"],
      fileName: (format) => `index.${format === "es" ? "js" : "cjs"}`,
    },
    rollupOptions: {
      external: (id: string) =>
        EXTERNAL_PACKAGES.some(
          (pkg) => id === pkg || id.startsWith(pkg + "/"),
        ),
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
        },
      },
    },
  },
});
