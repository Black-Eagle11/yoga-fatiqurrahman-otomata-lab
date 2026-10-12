
/**
 * Otomata Lab — Aplikasi utama.
 *
 * Halaman:
 * - Beranda
 * - Level 1: Alfabet dan string
 * - Level 2: Bahasa formal
 * - Level 3 & 4: DFA Workbench dan simulator
 * - Level 5: Studi kasus pintu otomatis
 *
 * Bonus B2–B7 tersedia melalui DFA Workbench.
 */

import { useState } from "react";

import AlphabetPlayground from "./components/AlphabetPlayground";
import LanguageChecker from "./components/LanguageChecker";
import DFAWorkbench from "./components/DFAWorkbench";
import AutomaticDoorStudy from "./components/AutomaticDoorStudy";
import ThemeToggle from "./components/ThemeToggle";

type PageId =
  | "home"
  | "alphabet"
  | "languages"
  | "dfa"
  | "door";

interface NavigationItem {
  id: PageId;
  label: string;
  icon: string;
  description: string;
}

const NAVIGATION_ITEMS: NavigationItem[] = [
  {
    id: "home",
    label: "Beranda",
    icon: "🏠",
    description: "Ringkasan dan navigasi aplikasi.",
  },
  {
    id: "alphabet",
    label: "Level 1",
    icon: "🔤",
    description: "Eksplorasi alfabet, string, concatenation, Σⁿ, dan Σ*.",
  },
  {
    id: "languages",
    label: "Level 2",
    icon: "📚",
    description: "Menguji keanggotaan string pada lima bahasa formal.",
  },
  {
    id: "dfa",
    label: "Level 3 & 4",
    icon: "⚙️",
    description: "Membangun DFA, mengedit transisi, simulasi, dan pengujian.",
  },
  {
    id: "door",
    label: "Level 5",
    icon: "🚪",
    description: "Studi kasus DFA menggunakan pintu otomatis.",
  },
];

/**
 * Header kecil untuk setiap halaman.
 */
interface PageHeadingProps {
  eyebrow: string;
  title: string;
  description: string;
}

function PageHeading({
  eyebrow,
  title,
  description,
}: PageHeadingProps) {
  return (
    <div className="mb-6">
      <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
        {eyebrow}
      </p>

      <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-100">
        {title}
      </h1>

      <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base dark:text-slate-400">
        {description}
      </p>
    </div>
  );
}

export default function App() {
  const [activePage, setActivePage] = useState<PageId>("home");

  const activeNavigation = NAVIGATION_ITEMS.find(
    (item) => item.id === activePage,
  );

  /**
   * Berpindah halaman tanpa melepas komponen lain dari React.
   * Dengan begitu, state internal tiap halaman tetap terjaga.
   */
  function pindahHalaman(page: PageId): void {
    setActivePage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-200 dark:bg-slate-950 dark:text-slate-100">
      {/* Header dan navigasi utama */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/95">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4 py-4">
            {/* Identitas aplikasi */}
            <button
              type="button"
              onClick={() => pindahHalaman("home")}
              className="flex items-center gap-3 rounded-xl text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-indigo-500"
              aria-label="Kembali ke beranda Otomata Lab"
            >
              <span
                aria-hidden="true"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-xl text-white shadow-sm"
              >
                ∑
              </span>

              <span>
                <span className="block text-lg font-extrabold tracking-tight">
                  Otomata Lab
                </span>

                <span className="block text-xs text-slate-500 dark:text-slate-400">
                  Teori Bahasa dan Otomata
                </span>
              </span>
            </button>

            {/* Kontrol tema */}
            <ThemeToggle />
          </div>

          {/* Menu horizontal yang dapat digulir di layar kecil */}
          <nav
            aria-label="Navigasi utama"
            className="flex gap-2 overflow-x-auto pb-3"
          >
            {NAVIGATION_ITEMS.map((item) => {
              const sedangAktif = activePage === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => pindahHalaman(item.id)}
                  aria-pressed={sedangAktif}
                  title={item.description}
                  className={[
                    "inline-flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-semibold transition-colors duration-150",
                    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500",
                    sedangAktif
                      ? "border-indigo-600 bg-indigo-600 text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-indigo-700 dark:hover:bg-indigo-950/40 dark:hover:text-indigo-300",
                  ].join(" ")}
                >
                  <span aria-hidden="true">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Konten aplikasi */}
      <main className="mx-auto min-h-[70vh] max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        {/* Beranda */}
        <section hidden={activePage !== "home"}>
          <div className="relative overflow-hidden rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-sky-50 p-6 sm:p-10 dark:border-indigo-900/60 dark:from-indigo-950/60 dark:via-slate-900 dark:to-slate-950">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-indigo-200/40 blur-3xl dark:bg-indigo-700/20"
            />

            <div className="relative max-w-3xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white/80 px-3 py-1.5 text-xs font-semibold text-indigo-700 dark:border-indigo-800 dark:bg-slate-900/80 dark:text-indigo-300">
                <span aria-hidden="true">✨</span>
                Laboratorium interaktif
              </span>

              <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-5xl dark:text-white">
                Jelajahi dunia
                <span className="block text-indigo-600 dark:text-indigo-400">
                  Bahasa dan Otomata
                </span>
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg dark:text-slate-300">
                Pelajari alfabet, bahasa formal, dan Deterministic
                Finite Automaton melalui eksperimen langsung.
                Bangun mesin, uji string, amati transisi state,
                dan pahami cara automata mengambil keputusan.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => pindahHalaman("alphabet")}
                  className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                >
                  Mulai belajar →
                </button>

                <button
                  type="button"
                  onClick={() => pindahHalaman("dfa")}
                  className="rounded-xl border border-slate-300 bg-white/80 px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  Buka DFA Workbench
                </button>
              </div>
            </div>
          </div>

          {/* Navigasi kartu setiap level */}
          <section className="mt-10">
            <div className="mb-5">
              <h2 className="text-xl font-bold">
                Pilih materi pembelajaran
              </h2>

              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                Mulai dari dasar sampai membangun automata sendiri.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {NAVIGATION_ITEMS.filter(
                (item) => item.id !== "home",
              ).map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => pindahHalaman(item.id)}
                  className="group rounded-2xl border border-slate-200 bg-white p-5 text-left transition duration-200 hover:-translate-y-1 hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-950/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-700 dark:hover:shadow-black/10"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-2xl dark:bg-indigo-950/70">
                      {item.icon}
                    </span>

                    <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>

                  <h3 className="mt-5 text-lg font-bold">
                    {item.label}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                    {item.description}
                  </p>

                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 transition group-hover:gap-3 dark:text-indigo-400">
                    Buka materi
                    <span aria-hidden="true">→</span>
                  </span>
                </button>
              ))}
            </div>
          </section>

          {/* Ringkasan fitur */}
          <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-xl font-bold">
              Apa yang bisa dilakukan di sini?
            </h2>

            <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <span className="text-2xl" aria-hidden="true">
                  🧪
                </span>

                <h3 className="mt-2 font-semibold">
                  Eksperimen string
                </h3>

                <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
                  Memeriksa keanggotaan string dan menghasilkan
                  kombinasi simbol.
                </p>
              </div>

              <div>
                <span className="text-2xl" aria-hidden="true">
                  🔁
                </span>

                <h3 className="mt-2 font-semibold">
                  Simulasi langkah demi langkah
                </h3>

                <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
                  Ikuti perpindahan state saat mesin membaca setiap
                  simbol masukan.
                </p>
              </div>

              <div>
                <span className="text-2xl" aria-hidden="true">
                  🛠️
                </span>

                <h3 className="mt-2 font-semibold">
                  Pengujian dan fitur bonus
                </h3>

                <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
                  Kelola DFA, uji beberapa string sekaligus, dan
                  analisis state melalui DFA Workbench.
                </p>
              </div>
            </div>
          </section>
        </section>

        {/* Level 1: alfabet dan string */}
        <section hidden={activePage !== "alphabet"}>
          <PageHeading
            eyebrow="Level 1 · Dasar"
            title="Alfabet dan String"
            description="Bangun alfabet, periksa validitas string, hitung panjang string, gabungkan string, serta eksplorasi Σⁿ dan Σ*."
          />

          <AlphabetPlayground />
        </section>

        {/* Level 2: bahasa formal */}
        <section hidden={activePage !== "languages"}>
          <PageHeading
            eyebrow="Level 2 · Bahasa formal"
            title="Language Checker"
            description="Pelajari lima bahasa formal pada alfabet {a, b}, uji keanggotaan string, dan jelajahi contoh string yang diterima."
          />

          <LanguageChecker />
        </section>

        {/* Level 3 dan 4: DFA Workbench */}
        <section hidden={activePage !== "dfa"}>
          <PageHeading
            eyebrow="Level 3 & 4 · Mesin automata"
            title="DFA Workbench"
            description="Bangun dan validasi DFA, edit tabel transisi, amati diagram state, jalankan simulasi, dan lakukan pengujian massal. Fitur bonus tersedia di halaman ini."
          />

          <DFAWorkbench />
        </section>

        {/* Level 5: studi kasus pintu otomatis */}
        <section hidden={activePage !== "door"}>
          <PageHeading
            eyebrow="Level 5 · Studi kasus"
            title="Pintu Otomatis"
            description="Amati bagaimana event sensor mengubah state pintu, dan hubungkan simulasi tersebut dengan konsep transisi pada DFA."
          />

          <AutomaticDoorStudy />
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-6 text-sm sm:px-6 lg:px-8">
          <div>
            <p className="font-bold">Otomata Lab</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Laboratorium interaktif Teori Bahasa dan Otomata.
            </p>
          </div>

          <button
            type="button"
            onClick={() => pindahHalaman("home")}
            className="rounded-lg px-3 py-2 font-semibold text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950/40"
          >
            Kembali ke beranda ↑
          </button>
        </div>
      </footer>

      {/* Informasi halaman untuk teknologi bantu */}
      <span className="sr-only" aria-live="polite">
        Halaman aktif: {activeNavigation?.label ?? "Beranda"}
      </span>
    </div>
  );
}
