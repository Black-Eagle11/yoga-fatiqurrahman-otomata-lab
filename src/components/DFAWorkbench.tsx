
/**
 * Otomata Lab — Level 4
 * Pusat pengelolaan DFA Builder dan Simulator.
 *
 * Satu objek DFA menjadi sumber data utama untuk tabel,
 * diagram state, simulator, pengujian massal, dan bonus.
 */

import {
    useCallback,
    useMemo,
    useState,
} from "react";

import {
    validateDFA,
    type DFA,
    type State,
    type TraceStep,
} from "../core/dfa";

import { PRESET_DFAS } from "../core/presets";

import TransitionTable from "./TransitionTable";
import StateDiagram from "./StateDiagram";
import Simulator from "./Simulator";
import TestRunner from "./TestRunner";
import BonusWorkbench from "./BonusWorkbench";

/**
 * Informasi progres simulasi yang digunakan untuk menyinkronkan
 * state aktif dan transisi terakhir dengan diagram.
 */
export interface SimulationProgress {
    activeState: State | null;
    activeTransition: TraceStep | null;
}

/**
 * Membuat salinan DFA agar perubahan tidak memodifikasi
 * objek preset bawaan secara langsung.
 */
function salinDFA(dfa: DFA): DFA {
    return {
        name: dfa.name,
        states: [...dfa.states],
        alphabet: [...dfa.alphabet],
        transitions: Object.fromEntries(
            Object.entries(dfa.transitions).map(([state, row]) => [
                state,
                { ...row },
            ]),
        ) as DFA["transitions"],
        start: dfa.start,
        accepting: [...dfa.accepting],
    };
}

export default function DFAWorkbench() {
    /**
     * Seluruh komponen editor menggunakan satu state DFA ini.
     */
    const [dfa, setDfa] = useState<DFA>(() =>
        salinDFA(PRESET_DFAS[0]!),
    );

    const [selectedPreset, setSelectedPreset] = useState(
        PRESET_DFAS[0]!.name,
    );

    const [progress, setProgress] =
        useState<SimulationProgress>({
            activeState: dfa.start,
            activeTransition: null,
        });

    const [showBonus, setShowBonus] = useState(false);

    /**
     * Memeriksa apakah DFA aktif sudah memenuhi seluruh
     * persyaratan struktur dan transisi.
     */
    const validationIssues = useMemo(
        () => validateDFA(dfa),
        [dfa],
    );

    const isDFAValid = validationIssues.length === 0;

    /**
     * Mengganti DFA aktif ketika pengguna memilih preset.
     */
    const handlePresetChange = useCallback(
        (namaPreset: string) => {
            const preset = PRESET_DFAS.find(
                (item) => item.name === namaPreset,
            );

            if (!preset) {
                return;
            }

            const salinan = salinDFA(preset);

            setDfa(salinan);
            setSelectedPreset(preset.name);

            setProgress({
                activeState: salinan.start,
                activeTransition: null,
            });
        },
        [],
    );

    /**
     * Menerima perubahan DFA dari editor tabel atau fitur bonus.
     *
     * Perubahan langsung diterapkan pada sumber data utama.
     */
    const handleDFAChange = useCallback((nextDFA: DFA) => {
        const salinan = salinDFA(nextDFA);

        setDfa(salinan);

        // DFA yang diedit tidak lagi ditandai sebagai preset asli.
        setSelectedPreset("");

        // Progres simulasi sebelumnya tidak berlaku untuk DFA baru.
        setProgress({
            activeState: salinan.start || null,
            activeTransition: null,
        });
    }, []);

    /**
     * Menerima progres dari simulator untuk ditampilkan
     * pada diagram state.
     */
    const handleSimulationProgress = useCallback(
        (nextProgress: SimulationProgress) => {
            setProgress(nextProgress);
        },
        [],
    );

    /**
     * Memperbarui data ketika suatu preset dipilih atau editor
     * mengubah state dan transisi.
     */
    const jumlahTransisiWajib =
        dfa.states.length * dfa.alphabet.length;

    const jumlahTransisiTerisi = dfa.states.reduce(
        (jumlah, state) =>
            jumlah +
            dfa.alphabet.filter((symbol) => {
                const tujuan = dfa.transitions[state]?.[symbol];

                return (
                    typeof tujuan === "string" &&
                    tujuan.trim() !== ""
                );
            }).length,
        0,
    );

    return (
        <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 dark:bg-slate-950 dark:text-slate-100 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl space-y-6">
                {/* Kepala halaman */}
                <header className="space-y-2">
                    <p className="text-sm font-semibold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                        Level 3 dan Level 4 · Teori Bahasa dan Otomata
                    </p>

                    <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                        DFA Builder &amp; Simulator
                    </h1>

                    <p className="max-w-3xl text-slate-600 dark:text-slate-400">
                        Buat, edit, visualisasikan, dan uji Deterministic
                        Finite Automaton menggunakan satu model DFA yang
                        dibagikan ke seluruh komponen.
                    </p>
                </header>

                {/* Pemilihan preset */}
                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                        <div className="flex-1">
                            <h2 className="text-xl font-semibold">
                                1. Pilih DFA
                            </h2>

                            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                                Mulai dengan salah satu dari empat DFA contoh,
                                atau ubah tabel transisinya untuk membangun
                                DFA sendiri.
                            </p>

                            <label
                                htmlFor="dfa-preset-selector"
                                className="mb-2 mt-4 block text-sm font-medium"
                            >
                                Preset DFA
                            </label>

                            <select
                                id="dfa-preset-selector"
                                value={selectedPreset}
                                onChange={(event) =>
                                    handlePresetChange(event.target.value)
                                }
                                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:focus:ring-indigo-950"
                            >
                                <option value="" disabled>
                                    DFA kustom — sedang diedit
                                </option>

                                {PRESET_DFAS.map((preset) => (
                                    <option key={preset.name} value={preset.name}>
                                        {preset.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-950">
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                DFA aktif
                            </p>

                            <p className="mt-1 font-semibold">
                                {dfa.name}
                            </p>

                            <p className="mt-2 font-mono text-sm">
                                M = (Q, Σ, δ, q0, F)
                            </p>
                        </div>
                    </div>
                </section>

                {/* Ringkasan model DFA */}
                <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Jumlah state
                        </p>

                        <p className="mt-1 text-2xl font-bold">
                            {dfa.states.length}
                        </p>

                        <p className="mt-1 break-all text-xs text-slate-500">
                            {dfa.states.join(", ") || "Belum ada state"}
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Jumlah simbol
                        </p>

                        <p className="mt-1 text-2xl font-bold">
                            {dfa.alphabet.length}
                        </p>

                        <p className="mt-1 break-all text-xs text-slate-500">
                            Σ = {"{"}
                            {dfa.alphabet.join(", ")}
                            {"}"}
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            State awal
                        </p>

                        <p className="mt-1 text-2xl font-bold">
                            {dfa.start || "Belum ditentukan"}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                            q0
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Transisi terisi
                        </p>

                        <p className="mt-1 text-2xl font-bold">
                            {jumlahTransisiTerisi}/{jumlahTransisiWajib}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                            Sel tabel yang mempunyai state tujuan
                        </p>
                    </div>
                </section>

                {/* Validasi DFA */}
                <section
                    role="status"
                    aria-live="polite"
                    className={[
                        "rounded-2xl border p-5",
                        isDFAValid
                            ? "border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/30"
                            : "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30",
                    ].join(" ")}
                >
                    <h2
                        className={[
                            "text-lg font-semibold",
                            isDFAValid
                                ? "text-emerald-800 dark:text-emerald-300"
                                : "text-red-800 dark:text-red-300",
                        ].join(" ")}
                    >
                        {isDFAValid
                            ? "✓ DFA valid"
                            : "⚠ DFA belum valid"}
                    </h2>

                    {isDFAValid ? (
                        <p className="mt-2 text-sm text-emerald-800 dark:text-emerald-200">
                            Struktur DFA, state awal, state akhir, dan seluruh
                            transisi telah lolos pemeriksaan validasi.
                        </p>
                    ) : (
                        <div className="mt-2 space-y-2 text-sm text-red-800 dark:text-red-200">
                            <p>
                                Perbaiki masalah berikut sebelum menjalankan
                                simulasi atau pengujian massal.
                            </p>

                            <ul className="list-inside list-disc space-y-1">
                                {validationIssues.map((masalah, indeks) => (
                                    <li key={`${masalah.type}-${indeks}`}>
                                        {masalah.message}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </section>

                {/* Editor tabel */}
                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
                    <h2 className="mb-4 text-xl font-semibold">
                        2. Editor tabel transisi
                    </h2>

                    <TransitionTable
                        dfa={dfa}
                        onChange={handleDFAChange}
                    />
                </section>

                {/* Diagram state */}
                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
                    <h2 className="mb-4 text-xl font-semibold">
                        3. Diagram state
                    </h2>

                    <StateDiagram
                        dfa={dfa}
                        activeState={progress.activeState}
                        activeTransition={progress.activeTransition}
                    />
                </section>

                {/* Simulator langkah demi langkah */}
                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
                    <h2 className="mb-4 text-xl font-semibold">
                        4. Simulator langkah demi langkah
                    </h2>

                    {!isDFAValid && (
                        <p className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
                            Simulasi dinonaktifkan sampai struktur DFA
                            valid. Perbaiki masalah validasi terlebih dahulu.
                        </p>
                    )}

                    <Simulator
                        dfa={dfa}
                        disabled={!isDFAValid}
                        onProgress={handleSimulationProgress}
                    />
                </section>

                {/* Pengujian massal */}
                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
                    <h2 className="mb-4 text-xl font-semibold">
                        5. Pengujian massal
                    </h2>

                    <TestRunner
                        dfa={dfa}
                        disabled={!isDFAValid}
                    />
                </section>

                {/* Bagian bonus */}
                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                                Fitur tambahan
                            </p>

                            <h2 className="mt-1 text-xl font-semibold">
                                Bonus B2–B7
                            </h2>

                            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                                Penyimpanan JSON, dead state otomatis, generator
                                contoh, analisis state, dan pembanding NFA.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => setShowBonus((terbuka) => !terbuka)}
                            className="rounded-xl border border-slate-300 px-4 py-2.5 font-semibold transition hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
                        >
                            {showBonus ? "Tutup fitur bonus" : "Buka fitur bonus"}
                        </button>
                    </div>

                    {showBonus && (
                        <div className="mt-5 border-t border-slate-200 pt-5 dark:border-slate-800">
                            <BonusWorkbench
                                dfa={dfa}
                                onDFAChange={handleDFAChange}
                            />
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}
