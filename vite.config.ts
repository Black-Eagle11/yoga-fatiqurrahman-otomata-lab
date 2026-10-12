
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vitest/config";

// Konfigurasi Vite, React, Tailwind CSS, dan Vitest.
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],

  test: {
    // Menggunakan lingkungan DOM untuk pengujian komponen React.
    environment: "jsdom",

    // Menjalankan konfigurasi awal pengujian.
    setupFiles: ["./tests/setup.ts"],

    // Pengujian menggunakan import eksplisit dari Vitest.
    globals: false,

    // Membersihkan mock sebelum setiap pengujian.
    clearMocks: true,
  },
});
