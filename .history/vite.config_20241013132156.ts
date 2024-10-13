import { VitePWA } from "vite-plugin-pwa";
import { defineConfig } from "vite";

export default defineConfig({
  base: "/",
  plugins: [
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "auto",
      devOptions: {
        enabled: true,
        navigateFallback: "index.html",
        suppressWarnings: true,
        type: "module",
      },
      pwaAssets: {
        disabled: false,
        config: true,
      },
      workbox: {
        sourcemap: true,
        globPatterns: ["**/*.{js,css,html,svg,png,ico, ttf}"],
      },
      includeAssets: [
        "robots.txt",
        "fonts/*",
        "img/*",
        "style.css",
        "https://kit.fontawesome.com/ce58f4085c.js",
        "https://api.mapbox.com/mapbox-gl-js/v2.8.1/mapbox-gl.css",
      ],
      manifest: {
        name: "StudentRestaurantAssignment",
        short_name: " StudentRestaurants",
        description: "application",
        theme_color: "#ffffff",
        icons: [
          {
            src: "/icons/restaurant_icon-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/icons/restaurant_icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/icons/restaurant_icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/icons/restaurant_icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          }
        ],
      },
    }),
  ],
});
