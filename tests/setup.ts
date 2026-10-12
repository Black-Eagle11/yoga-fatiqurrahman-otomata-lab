
/**
 * Otomata Lab — Konfigurasi awal pengujian UI.
 *
 * Tugas:
 * - Memuat matcher tambahan dari jest-dom.
 * - Membersihkan DOM setelah setiap pengujian.
 * - Menyiapkan mock matchMedia dan scrollTo untuk jsdom.
 * - Membersihkan penyimpanan browser agar tes terisolasi.
 */

import "@testing-library/jest-dom/vitest";

import { cleanup } from "@testing-library/react";
import {
    afterEach,
    beforeEach,
    vi,
} from "vitest";

/**
 * Menyiapkan mock preferensi tema sistem.
 *
 * Secara default, pengujian dimulai dengan tema terang.
 */
Object.defineProperty(window, "matchMedia", {
    configurable: true,
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
});

/**
 * jsdom tidak menyediakan perilaku scroll halaman seperti browser.
 * Mock ini mencegah peringatan ketika navigasi memanggil scrollTo.
 */
Object.defineProperty(window, "scrollTo", {
    configurable: true,
    writable: true,
    value: vi.fn(),
});

/**
 * Menyiapkan kondisi bersih sebelum setiap pengujian.
 */
beforeEach(() => {
    window.localStorage.clear();

    document.documentElement.classList.remove("dark");
    document.documentElement.style.colorScheme = "light";

    vi.clearAllMocks();
});

/**
 * Membersihkan DOM dan penyimpanan setelah setiap tes.
 */
afterEach(() => {
    cleanup();

    window.localStorage.clear();

    document.documentElement.classList.remove("dark");
    document.documentElement.style.colorScheme = "";

    vi.clearAllMocks();
});
