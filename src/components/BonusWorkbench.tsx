
/**
 * Otomata Lab — Bonus Workbench.
 *
 * Fitur bonus:
 * B2: Simpan/muat DFA dengan localStorage dan JSON.
 * B4: Melengkapi transisi yang hilang dengan dead state.
 * B5: Menghasilkan contoh string diterima dan ditolak.
 * B6: Mendeteksi state yang tidak terjangkau.
 * B7: Membandingkan DFA dan NFA untuk bahasa yang sama.
 */

import {
    useMemo,
    useState,
} from "react";

import {
    findDeadStates,
    run,
    validateDFA,
    type DFA,
    type State,
} from "../core/dfa";

import {
    findUnreachableStates,
    generateShortestExamples,
} from "../core/dfaAnalysis";

import {
    DFA_STORAGE_KEY,
    deserializeDFA,
    serializeDFA,
} from "../core/dfaPersistence";

import {
    hasNondeterministicTransition,
    runNFA,
    validateNFA,
    type NFA,
} from "../core/nfa";

import { endsWithOneDFA } from "../core/presets";

interface BonusWorkbenchProps {
    dfa: DFA;
    onDFAChange: (nextDFA: DFA) => void;
}

type PesanStatus = {
    jenis: "sukses" | "peringatan" | "error";
    teks: string;
};

/**
 * Mengubah string kosong menjadi notasi epsilon.
 */
function tampilkanString(input: string): string {
    return input === "" ? "ε" : input;
}

/**
 * Membuat nama dead state yang belum digunakan.
 */
function buatNamaDeadState(states: State[]): State {
    let nomor = 1;
    let nama = "qDead";

    while (states.includes(nama)) {
        nomor += 1;
        nama = `qDead${nomor}`;
    }

    return nama;
}

/**
 * NFA contoh yang menerima string biner yang berakhir
 * dengan simbol 1.
 *
 * Pada state q0, simbol 1 memiliki dua kemungkinan tujuan,
 * yaitu q0 dan q1. q1 merupakan state penerima.
 */
const nfaEndsWithOne: NFA = {
    name: "NFA — Ends With One",
    states: ["q0", "q1"],
    alphabet: ["0", "1"],
    transitions: {
        q0: {
            "0": ["q0"],
            "1": ["q0", "q1"],
        },
        q1: {
            "0": [],
            "1": [],
        },
    },
    start: "q0",
    accepting: ["q1"],
};

export default function BonusWorkbench({
    dfa,
    onDFAChange,
}: BonusWorkbenchProps) {
    const [pesan, setPesan] = useState<PesanStatus | null>(null);

    const [hasilContoh, setHasilContoh] = useState<
        ReturnType<typeof generateShortestExamples> | null
    >(null);

    const [inputPerbandingan, setInputPerbandingan] =
        useState("101");

    /**
     * Menghitung state yang tidak terjangkau dari state awal.
     */
    const stateTidakTerjangkau = useMemo(
        () => findUnreachableStates(dfa),
        [dfa],
    );

    /**
     * Menghitung dead state yang sudah ada.
     */
    const deadStates = useMemo(
        () => findDeadStates(dfa),
        [dfa],
    );

    /**
     * Memeriksa validitas DFA yang sedang digunakan.
     */
    const masalahDFA = useMemo(
        () => validateDFA(dfa),
        [dfa],
    );

    const dfaValid = masalahDFA.length === 0;

    /**
     * Memeriksa mesin contoh NFA untuk fitur perbandingan.
     */
    const masalahNFA = useMemo(
        () => validateNFA(nfaEndsWithOne),
        [],
    );

    const nfaValid = masalahNFA.length === 0;

    /**
     * Menyimpan status operasi agar pesan antarfungsi konsisten.
     */
    function beriPesan(
        jenis: PesanStatus["jenis"],
        teks: string,
    ): void {
        setPesan({ jenis, teks });
    }

    /**
     * Menyimpan DFA saat ini ke localStorage.
     */
    function simpanKeBrowser(): void {
        try {
            if (!dfaValid) {
                beriPesan(
                    "error",
                    "DFA belum valid. Perbaiki struktur DFA sebelum menyimpannya.",
                );
                return;
            }

            const json = serializeDFA(dfa);

            window.localStorage.setItem(DFA_STORAGE_KEY, json);

            beriPesan(
                "sukses",
                "DFA berhasil disimpan ke localStorage pada browser ini.",
            );
        } catch (error) {
            beriPesan(
                "error",
                error instanceof Error
                    ? `Gagal menyimpan DFA: ${error.message}`
                    : "Gagal menyimpan DFA. Periksa izin penyimpanan browser.",
            );
        }
    }

    /**
     * Memuat DFA yang sebelumnya disimpan di browser.
     */
    function muatDariBrowser(): void {
        try {
            const json = window.localStorage.getItem(DFA_STORAGE_KEY);

            if (json === null) {
                beriPesan(
                    "peringatan",
                    "Belum ada DFA tersimpan pada browser ini.",
                );
                return;
            }

            const dfaTersimpan = deserializeDFA(json);

            onDFAChange(dfaTersimpan);

            setHasilContoh(null);

            beriPesan(
                "sukses",
                `DFA "${dfaTersimpan.name}" berhasil dimuat dari localStorage.`,
            );
        } catch (error) {
            beriPesan(
                "error",
                error instanceof Error
                    ? `Gagal memuat DFA: ${error.message}`
                    : "Data tersimpan tidak dapat dibaca sebagai DFA yang valid.",
            );
        }
    }

    /**
     * Menghapus DFA yang disimpan pada browser.
     */
    function hapusDariBrowser(): void {
        try {
            window.localStorage.removeItem(DFA_STORAGE_KEY);

            beriPesan(
                "sukses",
                "DFA tersimpan berhasil dihapus dari localStorage.",
            );
        } catch (error) {
            beriPesan(
                "error",
                error instanceof Error
                    ? `Gagal menghapus data: ${error.message}`
                    : "Data tidak berhasil dihapus.",
            );
        }
    }

    /**
     * Mengunduh DFA aktif dalam bentuk berkas JSON.
     */
    function eksporJSON(): void {
        try {
            if (!dfaValid) {
                beriPesan(
                    "error",
                    "DFA belum valid. Perbaiki struktur sebelum mengekspor JSON.",
                );
                return;
            }

            const isiJSON = serializeDFA(dfa);
            const berkas = new Blob(
                [isiJSON],
                { type: "application/json;charset=utf-8" },
            );

            const url = URL.createObjectURL(berkas);
            const tautan = document.createElement("a");

            tautan.href = url;
            tautan.download = "otomata-lab-dfa.json";

            document.body.appendChild(tautan);
            tautan.click();
            tautan.remove();

            URL.revokeObjectURL(url);

            beriPesan(
                "sukses",
                "Berkas JSON DFA berhasil disiapkan untuk diunduh.",
            );
        } catch (error) {
            beriPesan(
                "error",
                error instanceof Error
                    ? `Ekspor JSON gagal: ${error.message}`
                    : "Ekspor JSON gagal.",
            );
        }
    }

    /**
     * Membaca dan memvalidasi berkas DFA JSON dari pengguna.
     */
    async function imporJSON(
        event: React.ChangeEvent<HTMLInputElement>,
    ): Promise<void> {
        const berkas = event.target.files?.[0];

        if (!berkas) {
            return;
        }

        try {
            const isiBerkas = await berkas.text();
            const dfaImpor = deserializeDFA(isiBerkas);

            onDFAChange(dfaImpor);

            setHasilContoh(null);

            beriPesan(
                "sukses",
                `DFA "${dfaImpor.name}" berhasil diimpor.`,
            );
        } catch (error) {
            beriPesan(
                "error",
                error instanceof Error
                    ? `Impor ditolak: ${error.message}`
                    : "Berkas tidak dapat diimpor sebagai DFA yang valid.",
            );
        } finally {
            // Memungkinkan berkas yang sama dipilih kembali.
            event.target.value = "";
        }
    }

    /**
     * Melengkapi semua transisi kosong atau tidak valid dengan
     * transisi menuju dead state baru.
     *
     * Dead state memiliki transisi kembali ke dirinya sendiri
     * untuk semua simbol dalam alfabet.
     */
    function lengkapiDeadState(): void {
        if (dfa.states.length === 0) {
            beriPesan(
                "peringatan",
                "Tambahkan setidaknya satu state sebelum melengkapi transisi.",
            );
            return;
        }

        if (dfa.alphabet.length === 0) {
            beriPesan(
                "peringatan",
                "Tambahkan setidaknya satu simbol alfabet terlebih dahulu.",
            );
            return;
        }

        const perluDilengkapi = dfa.states.some((state) =>
            dfa.alphabet.some((simbol) => {
                const tujuan = dfa.transitions[state]?.[simbol];

                return !tujuan || !dfa.states.includes(tujuan);
            }),
        );

        if (!perluDilengkapi) {
            beriPesan(
                "sukses",
                "Seluruh transisi DFA sudah lengkap. Tidak diperlukan dead state baru.",
            );
            return;
        }

        const namaDead = buatNamaDeadState(dfa.states);
        const statesBerikutnya = [...dfa.states, namaDead];

        const transitionsBerikutnya: DFA["transitions"] = {};

        for (const state of dfa.states) {
            transitionsBerikutnya[state] = {};

            for (const simbol of dfa.alphabet) {
                const tujuanLama = dfa.transitions[state]?.[simbol];

                transitionsBerikutnya[state]![simbol] =
                    tujuanLama && dfa.states.includes(tujuanLama)
                        ? tujuanLama
                        : namaDead;
            }
        }

        // Dead state selalu kembali ke dirinya sendiri.
        transitionsBerikutnya[namaDead] = {};

        for (const simbol of dfa.alphabet) {
            transitionsBerikutnya[namaDead]![simbol] = namaDead;
        }

        const dfaBerikutnya: DFA = {
            ...dfa,
            states: statesBerikutnya,
            transitions: transitionsBerikutnya,
        };

        onDFAChange(dfaBerikutnya);
        setHasilContoh(null);

        const masalahBaru = validateDFA(dfaBerikutnya);

        if (masalahBaru.length === 0) {
            beriPesan(
                "sukses",
                `Dead state "${namaDead}" berhasil ditambahkan. Transisi yang kosong atau tidak valid kini mengarah ke state tersebut.`,
            );
        } else {
            beriPesan(
                "peringatan",
                `Dead state "${namaDead}" ditambahkan, tetapi masih ada ${masalahBaru.length} masalah DFA yang perlu diperbaiki.`,
            );
        }
    }

    /**
     * Menghasilkan contoh string pendek untuk kedua kategori.
     */
    function cariContohString(): void {
        try {
            if (!dfaValid) {
                beriPesan(
                    "error",
                    "Perbaiki DFA terlebih dahulu sebelum mencari contoh string.",
                );
                return;
            }

            const hasil = generateShortestExamples(dfa, {
                count: 5,
                maxLength: Math.max(8, dfa.states.length + 2),
                maxCandidates: 25000,
            });

            setHasilContoh(hasil);

            beriPesan(
                hasil.truncated ? "peringatan" : "sukses",
                hasil.truncated
                    ? "Pencarian mencapai batas kandidat. Contoh yang ditemukan ditampilkan, tetapi jumlah yang diminta mungkin belum lengkap."
                    : "Pencarian contoh string selesai.",
            );
        } catch (error) {
            beriPesan(
                "error",
                error instanceof Error
                    ? `Analisis contoh gagal: ${error.message}`
                    : "Contoh string tidak berhasil dihasilkan.",
            );
        }
    }

    /**
     * Mengembalikan contoh hasil analisis ke kondisi awal.
     */
    function hapusContohString(): void {
        setHasilContoh(null);
        beriPesan("sukses", "Hasil analisis contoh string dihapus.");
    }

    /**
     * Menjalankan DFA dan NFA contoh untuk string yang sama.
     */
    const hasilDFAContoh = useMemo(
        () => run(endsWithOneDFA, inputPerbandingan),
        [inputPerbandingan],
    );

    const hasilNFAContoh = useMemo(
        () => runNFA(nfaEndsWithOne, inputPerbandingan),
        [inputPerbandingan],
    );

    const hasilPerbandinganBisaDinilai =
        hasilDFAContoh.error === undefined &&
        hasilNFAContoh.error === undefined &&
        nfaValid;

    const hasilPerbandinganSama =
        hasilPerbandinganBisaDinilai &&
        hasilDFAContoh.accepted === hasilNFAContoh.accepted;

    return (
        <div className="space-y-6">
            {/* Judul */}
            <section>
                <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                    Otomata Lab · Fitur Bonus
                </p>

                <h2 className="mt-1 text-2xl font-bold">
                    Bonus Workbench
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                    Kelola DFA, lengkapi transisi, analisis state dan string,
                    serta pelajari perbedaan automata deterministik dan nondeterministik.
                </p>
            </section>

            {/* Pesan status operasi */}
            {pesan && (
                <section
                    role="status"
                    aria-live="polite"
                    className={[
                        "rounded-xl border p-4 text-sm",
                        pesan.jenis === "sukses"
                            ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200"
                            : pesan.jenis === "peringatan"
                                ? "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200"
                                : "border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200",
                    ].join(" ")}
                >
                    {pesan.teks}
                </section>
            )}

            {/* B2 — Penyimpanan dan pertukaran JSON */}
            <section className="space-y-4 rounded-2xl border border-slate-200 p-5 dark:border-slate-700">
                <div>
                    <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                        Bonus B2
                    </p>

                    <h3 className="mt-1 text-lg font-bold">
                        Simpan, muat, dan ekspor DFA
                    </h3>

                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                        Simpan DFA pada browser yang digunakan atau pindahkan
                        konfigurasi ke perangkat lain melalui berkas JSON.
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    <button
                        type="button"
                        onClick={simpanKeBrowser}
                        className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
                    >
                        Simpan ke browser
                    </button>

                    <button
                        type="button"
                        onClick={muatDariBrowser}
                        className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
                    >
                        Muat dari browser
                    </button>

                    <button
                        type="button"
                        onClick={hapusDariBrowser}
                        className="rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-50 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950/40"
                    >
                        Hapus simpanan
                    </button>
                </div>

                <div className="flex flex-wrap items-center gap-3 border-t border-slate-200 pt-4 dark:border-slate-700">
                    <button
                        type="button"
                        onClick={eksporJSON}
                        className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
                    >
                        ↓ Ekspor JSON
                    </button>

                    <label className="inline-flex cursor-pointer items-center rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800">
                        ↑ Impor JSON
                        <input
                            type="file"
                            accept=".json,application/json"
                            className="sr-only"
                            onChange={imporJSON}
                        />
                    </label>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400">
                    Catatan: localStorage hanya tersedia pada browser dan
                    origin aplikasi yang sama. Ekspor JSON berguna untuk
                    membuat cadangan atau berbagi konfigurasi.
                </p>
            </section>

            {/* B4 — Auto dead state */}
            <section className="space-y-4 rounded-2xl border border-slate-200 p-5 dark:border-slate-700">
                <div>
                    <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                        Bonus B4
                    </p>

                    <h3 className="mt-1 text-lg font-bold">
                        Pelengkapan dead state otomatis
                    </h3>

                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                        Transisi yang kosong atau memiliki tujuan yang tidak
                        dikenal akan diarahkan ke dead state baru. Dead state
                        kembali ke dirinya sendiri untuk setiap simbol alfabet.
                    </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-950">
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Jumlah state
                        </p>

                        <p className="mt-1 text-2xl font-bold">
                            {dfa.states.length}
                        </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-950">
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Dead state terdeteksi
                        </p>

                        <p className="mt-1 text-2xl font-bold">
                            {deadStates.length}
                        </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-950">
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Transisi bermasalah
                        </p>

                        <p className="mt-1 text-2xl font-bold">
                            {masalahDFA.filter(
                                (issue) => issue.type === "MISSING_TRANSITION",
                            ).length}
                        </p>
                    </div>
                </div>

                {deadStates.length > 0 && (
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        Dead state yang terdeteksi:{" "}
                        <span className="font-mono font-semibold">
                            {deadStates.join(", ")}
                        </span>
                    </p>
                )}

                <button
                    type="button"
                    onClick={lengkapiDeadState}
                    disabled={dfa.states.length === 0 || dfa.alphabet.length === 0}
                    className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    Lengkapi transisi otomatis
                </button>
            </section>

            {/* B5 — Contoh string terpendek */}
            <section className="space-y-4 rounded-2xl border border-slate-200 p-5 dark:border-slate-700">
                <div>
                    <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                        Bonus B5
                    </p>

                    <h3 className="mt-1 text-lg font-bold">
                        Pencarian contoh string
                    </h3>

                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                        Cari hingga lima contoh string pendek yang diterima
                        dan ditolak oleh DFA aktif. Pencarian memiliki batas
                        kandidat agar tidak berjalan tanpa batas.
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    <button
                        type="button"
                        onClick={cariContohString}
                        disabled={!dfaValid}
                        className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Cari contoh string
                    </button>

                    {hasilContoh && (
                        <button
                            type="button"
                            onClick={hapusContohString}
                            className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
                        >
                            Hapus hasil
                        </button>
                    )}
                </div>

                {hasilContoh && (
                    <div className="space-y-4">
                        <div className="grid gap-3 sm:grid-cols-2">
                            <div className="rounded-xl border border-emerald-200 p-4 dark:border-emerald-900">
                                <h4 className="font-semibold text-emerald-700 dark:text-emerald-300">
                                    String diterima
                                </h4>

                                {hasilContoh.accepted.length === 0 ? (
                                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                                        Belum ditemukan string yang diterima dalam
                                        batas pencarian.
                                    </p>
                                ) : (
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {hasilContoh.accepted.map((kata, index) => (
                                            <code
                                                key={`${kata}-${index}`}
                                                className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200"
                                            >
                                                {tampilkanString(String(kata))}
                                            </code>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="rounded-xl border border-red-200 p-4 dark:border-red-900">
                                <h4 className="font-semibold text-red-700 dark:text-red-300">
                                    String ditolak
                                </h4>

                                {hasilContoh.rejected.length === 0 ? (
                                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                                        Belum ditemukan string yang ditolak dalam
                                        batas pencarian.
                                    </p>
                                ) : (
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {hasilContoh.rejected.map((kata, index) => (
                                            <code
                                                key={`${kata}-${index}`}
                                                className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-900 dark:bg-red-950 dark:text-red-200"
                                            >
                                                {tampilkanString(String(kata))}
                                            </code>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="rounded-xl bg-slate-50 p-4 text-sm dark:bg-slate-950">
                            <p>
                                Kandidat yang diperiksa:{" "}
                                <strong>{hasilContoh.examined}</strong>
                            </p>

                            <p className="mt-1">
                                Batas panjang string:{" "}
                                <strong>{hasilContoh.maxLength}</strong>
                            </p>

                            <p className="mt-1">
                                Status pencarian:{" "}
                                <strong>
                                    {hasilContoh.truncated
                                        ? "Belum lengkap — batas pencarian tercapai"
                                        : "Selesai"}
                                </strong>
                            </p>
                        </div>
                    </div>
                )}
            </section>

            {/* B6 — State tidak terjangkau */}
            <section className="space-y-4 rounded-2xl border border-slate-200 p-5 dark:border-slate-700">
                <div>
                    <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                        Bonus B6
                    </p>

                    <h3 className="mt-1 text-lg font-bold">
                        Analisis keterjangkauan state
                    </h3>

                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                        Penelusuran dimulai dari state awal. State disebut tidak
                        terjangkau apabila tidak dapat dicapai melalui rangkaian
                        transisi dari state awal.
                    </p>
                </div>

                <div
                    className={[
                        "rounded-xl border p-4",
                        stateTidakTerjangkau.length === 0
                            ? "border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/30"
                            : "border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30",
                    ].join(" ")}
                >
                    <p className="font-semibold">
                        {stateTidakTerjangkau.length === 0
                            ? "Semua state dapat dijangkau."
                            : `${stateTidakTerjangkau.length} state tidak terjangkau.`}
                    </p>

                    {stateTidakTerjangkau.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                            {stateTidakTerjangkau.map((state) => (
                                <code
                                    key={state}
                                    className="rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm dark:border-amber-800 dark:bg-slate-950"
                                >
                                    {state}
                                </code>
                            ))}
                        </div>
                    )}
                </div>

                <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        State DFA: {dfa.states.length}
                    </p>

                    <div className="mt-2 flex flex-wrap gap-2">
                        {dfa.states.map((state) => {
                            const tidakTerjangkau =
                                stateTidakTerjangkau.includes(state);

                            return (
                                <span
                                    key={state}
                                    className={[
                                        "rounded-lg px-3 py-2 font-mono text-sm",
                                        tidakTerjangkau
                                            ? "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200"
                                            : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
                                    ].join(" ")}
                                >
                                    {state}
                                    {state === dfa.start ? " (awal)" : ""}
                                </span>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* B7 — Perbandingan DFA dan NFA */}
            <section className="space-y-4 rounded-2xl border border-slate-200 p-5 dark:border-slate-700">
                <div>
                    <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                        Bonus B7
                    </p>

                    <h3 className="mt-1 text-lg font-bold">
                        Perbandingan DFA dan NFA
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
                        Contoh ini menggunakan bahasa yang sama: seluruh string
                        dari alfabet {`{0, 1}`} yang berakhir dengan simbol
                        {" "}1. DFA memiliki satu transisi tujuan untuk setiap
                        pasangan state dan simbol. NFA dapat memiliki lebih dari
                        satu kemungkinan state tujuan.
                    </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-950">
                        <h4 className="font-semibold">DFA: Ends With One</h4>

                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                            State: {endsWithOneDFA.states.join(", ")}
                        </p>

                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                            State penerima: {endsWithOneDFA.accepting.join(", ")}
                        </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-950">
                        <h4 className="font-semibold">NFA: Ends With One</h4>

                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                            State: {nfaEndsWithOne.states.join(", ")}
                        </p>

                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                            State penerima: {nfaEndsWithOne.accepting.join(", ")}
                        </p>

                        <p className="mt-2 text-xs text-indigo-600 dark:text-indigo-400">
                            {hasNondeterministicTransition(nfaEndsWithOne)
                                ? "Memiliki transisi nondeterministik."
                                : "Tidak ditemukan transisi nondeterministik."}
                        </p>
                    </div>
                </div>

                {!nfaValid && (
                    <div
                        role="alert"
                        className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200"
                    >
                        NFA contoh belum valid. Periksa struktur NFA sebelum
                        menjalankan perbandingan.
                        <ul className="mt-2 list-inside list-disc">
                            {masalahNFA.map((issue, index) => (
                                <li key={`${issue.type}-${index}`}>
                                    {issue.message}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                <div>
                    <label
                        htmlFor="dfa-nfa-comparison-input"
                        className="mb-2 block text-sm font-medium"
                    >
                        String yang diuji pada kedua mesin
                    </label>

                    <input
                        id="dfa-nfa-comparison-input"
                        value={inputPerbandingan}
                        onChange={(event) =>
                            setInputPerbandingan(event.target.value)
                        }
                        placeholder="Contoh: 101"
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-mono outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:focus:ring-indigo-950"
                    />

                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                        Gunakan simbol 0 dan 1. Kosongkan input untuk menguji ε.
                    </p>
                </div>

                {hasilPerbandinganBisaDinilai && (
                    <>
                        <div className="grid gap-3 sm:grid-cols-2">
                            <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Hasil DFA
                                </p>

                                <p
                                    className={[
                                        "mt-2 text-lg font-bold",
                                        hasilDFAContoh.accepted
                                            ? "text-emerald-600 dark:text-emerald-300"
                                            : "text-red-600 dark:text-red-300",
                                    ].join(" ")}
                                >
                                    {hasilDFAContoh.accepted
                                        ? "✓ Diterima"
                                        : "✗ Ditolak"}
                                </p>

                                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                    State akhir: {hasilDFAContoh.finalState}
                                </p>
                            </div>

                            <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Hasil NFA
                                </p>

                                <p
                                    className={[
                                        "mt-2 text-lg font-bold",
                                        hasilNFAContoh.accepted
                                            ? "text-emerald-600 dark:text-emerald-300"
                                            : "text-red-600 dark:text-red-300",
                                    ].join(" ")}
                                >
                                    {hasilNFAContoh.accepted
                                        ? "✓ Diterima"
                                        : "✗ Ditolak"}
                                </p>

                                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                    NFA diterima jika setidaknya satu jalur berakhir
                                    di state penerima.
                                </p>
                            </div>
                        </div>

                        <div
                            role="status"
                            aria-live="polite"
                            className={[
                                "rounded-xl border p-4 text-sm",
                                hasilPerbandinganSama
                                    ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200"
                                    : "border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200",
                            ].join(" ")}
                        >
                            {hasilPerbandinganSama
                                ? "Hasil keduanya sama untuk string ini."
                                : "Hasil berbeda untuk string ini. Periksa implementasi mesin."}
                        </div>
                    </>
                )}

                {!hasilPerbandinganBisaDinilai && (
                    <p
                        role="alert"
                        className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200"
                    >
                        String ini tidak dapat dibandingkan karena setidaknya
                        satu mesin mengalami kesalahan input atau validasi.
                        Gunakan hanya simbol 0 dan 1.
                    </p>
                )}
            </section>
        </div>
    );
}
