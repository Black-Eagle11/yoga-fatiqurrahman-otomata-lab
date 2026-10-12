
/**
 * Otomata Lab — Titik masuk aplikasi React.
 *
 * Tugas:
 * - Menemukan elemen root dari index.html.
 * - Memuat stylesheet global.
 * - Merender komponen utama menggunakan React.
 */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App";
import "./styles.css";

/**
 * Memastikan elemen root tersedia sebelum aplikasi dijalankan.
 */
const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error(
    'Elemen root tidak ditemukan. Pastikan index.html memiliki <div id="root"></div>.',
  );
}

/**
 * Merender aplikasi dalam StrictMode untuk membantu
 * mendeteksi masalah penggunaan React selama pengembangan.
 */
createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
