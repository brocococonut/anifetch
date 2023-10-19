import { defineConfig } from "astro/config";
import svelte from "@astrojs/svelte";
import node from "@astrojs/node";
import { purgeCss } from "vite-plugin-tailwind-purgecss";

import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
  integrations: [svelte(), tailwind()],
  adapter: node({
    mode: "standalone",
  }),
  output: "server",
  vite: {
    plugins: [purgeCss()],
    resolve: {
      alias: {
        "$utils/*": ["src/utils/*"],
        "$types/*": ["src/types/*"],
        "$layouts/*": ["src/layouts/*"],
        "$components/*": ["src/components/*"],
      },
    },
    server: {
      watch: {
        ignored: ["**/downloads", "**/logs"]
      }
    }
  },
});
