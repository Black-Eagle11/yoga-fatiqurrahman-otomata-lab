
/**
 * Otomata Lab — Pengalih tema.
 *
 * Fitur:
 * - Mengganti tema terang dan gelap.
 * - Menyimpan pilihan tema di localStorage.
 * - Mengikuti preferensi sistem saat belum ada pilihan tersimpan.
 *
 * Ikon menggunakan emoji agar tidak bergantung pada lucide-react.
 */

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

const THEME_STORAGE_KEY = "otomata-lab-theme";

/**
 * Membaca tema dari penyimpanan browser.
 * Jika belum ada, gunakan preferensi tema sistem.
 */
function getInitialTheme(): Theme {
    try {
        const savedTheme = window.localStorage.getItem(
            THEME_STORAGE_KEY,
        );

        if (savedTheme === "light" || savedTheme === "dark") {
            return savedTheme;
        }

        if (
            window.matchMedia?.("(prefers-color-scheme: dark)").matches
        ) {
            return "dark";
        }
    } catch {
        // Gunakan tema terang jika penyimpanan tidak tersedia.
    }

    return "light";
}

export default function ThemeToggle() {
    const [theme, setTheme] = useState<Theme>(getInitialTheme);

    useEffect(() => {
        const root = document.documentElement;

        root.classList.toggle("dark", theme === "dark");
        root.style.colorScheme = theme;

        try {
            window.localStorage.setItem(THEME_STORAGE_KEY, theme);
        } catch {
            // Tema tetap berfungsi meskipun penyimpanan tidak tersedia.
        }
    }, [theme]);

    function toggleTheme(): void {
        setTheme((current) =>
            current === "dark" ? "light" : "dark",
        );
    }

    const isDark = theme === "dark";

    return (
        <button
            type="button"
            onClick={toggleTheme}
            aria-label={
                isDark
                    ? "Aktifkan mode terang"
                    : "Aktifkan mode gelap"
            }
            aria-pressed={isDark}
            title={
                isDark
                    ? "Ganti ke mode terang"
                    : "Ganti ke mode gelap"
            }
            className={[
                "inline-flex items-center justify-center gap-2",
                "rounded-xl border px-3 py-2",
                "text-sm font-semibold",
                "transition-colors duration-200",
                "focus-visible:outline-2 focus-visible:outline-offset-2",
                "focus-visible:outline-indigo-500",
                "border-slate-200 bg-white text-slate-700",
                "hover:bg-slate-100",
                "dark:border-slate-700 dark:bg-slate-900",
                "dark:text-slate-200 dark:hover:bg-slate-800",
            ].join(" ")}
        >
            <span aria-hidden="true" className="text-lg">
                {isDark ? "☀️" : "🌙"}
            </span>

            <span>
                {isDark ? "Mode terang" : "Mode gelap"}
            </span>
        </button>
    );
}
