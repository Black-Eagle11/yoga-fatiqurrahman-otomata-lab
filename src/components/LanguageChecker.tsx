
/**
 * Otomata Lab — Level 2 dan Bonus B3
 * Pemeriksa keanggotaan bahasa dan kuis interaktif.
 *
 * Logika bahasa diambil dari core/language.ts.
 * Generator himpunan string diambil dari core/alphabet.ts.
 */

import { useMemo, useState } from "react";

import {
    PRESET_LANGUAGES,
    membersUpTo,
    type Language,
} from "../core/language";

import { sigmaStar } from "../core/alphabet";

/**
 * Batas panjang string untuk visualisasi dan kuis.
 */
const BATAS_PANJANG = 4;

/**
 * Menampilkan string kosong sebagai epsilon.
 */
function tampilkanString(teks: string): string {
    return teks === "" ? "ε" : teks;
}

/**
 * Memilih satu string secara acak dari kumpulan kandidat.
 */
function buatSoalAcak(bahasa: Language): string {
    const kandidat = sigmaStar(bahasa.sigma, BATAS_PANJANG);

    if (kandidat.length === 0) {
        return "";
    }

    const indeks = Math.floor(Math.random() * kandidat.length);

    return kandidat[indeks];
}

/**
 * Mencari preset bahasa berdasarkan ID.
 */
function cariBahasa(id: string): Language {
    const bahasa = PRESET_LANGUAGES.find(
        (item) => item.id === id,
    );

    if (!bahasa) {
        return PRESET_LANGUAGES[0]!;
    }

    return bahasa;
}

export default function LanguageChecker() {
    const [languageId, setLanguageId] = useState(
        PRESET_LANGUAGES[0]!.id,
    );

    const [inputString, setInputString] = useState("ab");
    const [maxLen, setMaxLen] = useState(3);

    const [showQuiz, setShowQuiz] = useState(false);
    const [quizQuestion, setQuizQuestion] = useState(() =>
        buatSoalAcak(PRESET_LANGUAGES[0]!),
    );

    const [quizAnswer, setQuizAnswer] = useState<boolean | null>(
        null,
    );

    const [quizFeedback, setQuizFeedback] = useState("");
    const [quizScore, setQuizScore] = useState(0);
    const [quizTotal, setQuizTotal] = useState(0);

    const bahasaAktif = useMemo(
        () => cariBahasa(languageId),
        [languageId],
    );

    /**
     * Mengambil semua string yang menjadi anggota bahasa.
     */
    const anggotaBahasa = useMemo(
        () => membersUpTo(bahasaAktif, maxLen),
        [bahasaAktif, maxLen],
    );

    /**
     * Menghasilkan seluruh semesta string untuk divisualisasikan.
     */
    const semestaString = useMemo(
        () => sigmaStar(bahasaAktif.sigma, maxLen),
        [bahasaAktif, maxLen],
    );

    /**
     * Memeriksa apakah input termasuk bahasa yang dipilih.
     */
    const inputDiterima = bahasaAktif.accepts(inputString);

    /**
     * Mengganti bahasa sekaligus menyiapkan soal kuis baru.
     */
    function gantiBahasa(id: string): void {
        const bahasa = cariBahasa(id);

        setLanguageId(id);
        setQuizQuestion(buatSoalAcak(bahasa));
        setQuizAnswer(null);
        setQuizFeedback("");
    }

    /**
     * Memeriksa jawaban kuis dan memperbarui skor.
     */
    function jawabKuis(tebakan: boolean): void {
        if (quizAnswer !== null) {
            return;
        }

        const jawabanBenar =
            bahasaAktif.accepts(quizQuestion) === tebakan;

        setQuizAnswer(tebakan);
        setQuizTotal((jumlah) => jumlah + 1);

        if (jawabanBenar) {
            setQuizScore((skor) => skor + 1);
            setQuizFeedback("Benar! Jawaban kamu tepat.");
        } else {
            setQuizFeedback(
                `Belum tepat. String ${tampilkanString(quizQuestion)} ${bahasaAktif.accepts(quizQuestion)
                    ? "termasuk"
                    : "tidak termasuk"
                } dalam bahasa ${bahasaAktif.name}.`,
            );
        }
    }

    /**
     * Menyiapkan soal berikutnya tanpa mengubah skor.
     */
    function soalBerikutnya(): void {
        setQuizQuestion(buatSoalAcak(bahasaAktif));
        setQuizAnswer(null);
        setQuizFeedback("");
    }

    /**
     * Mengatur ulang nilai kuis ke nol.
     */
    function resetKuis(): void {
        setQuizScore(0);
        setQuizTotal(0);
        setQuizQuestion(buatSoalAcak(bahasaAktif));
        setQuizAnswer(null);
        setQuizFeedback("");
    }

    return (
        <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 dark:bg-slate-950 dark:text-slate-100 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-6xl space-y-6">
                <header className="space-y-2">
                    <p className="text-sm font-semibold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                        Level 2 · Teori Bahasa dan Otomata
                    </p>

                    <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                        Language Checker
                    </h1>

                    <p className="max-w-3xl text-slate-600 dark:text-slate-400">
                        Pelajari bahasa formal dengan menguji keanggotaan
                        string dan melihat hubungan bahasa dengan seluruh
                        string yang mungkin dibentuk oleh alfabetnya.
                    </p>
                </header>

                {/* Bagian pemilihan aturan bahasa */}
                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
                    <h2 className="text-xl font-semibold">
                        1. Pilih aturan bahasa
                    </h2>

                    <label
                        htmlFor="language-selector"
                        className="mb-2 mt-4 block text-sm font-medium"
                    >
                        Aturan bahasa
                    </label>

                    <select
                        id="language-selector"
                        value={languageId}
                        onChange={(event) => gantiBahasa(event.target.value)}
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:focus:ring-indigo-950"
                    >
                        {PRESET_LANGUAGES.map((bahasa) => (
                            <option key={bahasa.id} value={bahasa.id}>
                                {bahasa.name}
                            </option>
                        ))}
                    </select>

                    <div className="mt-4 rounded-xl bg-indigo-50 p-4 dark:bg-indigo-950/40">
                        <p className="text-sm text-indigo-700 dark:text-indigo-300">
                            Alfabet bahasa
                        </p>

                        <p className="mt-1 font-mono text-lg font-semibold">
                            Σ = {"{"}
                            {bahasaAktif.sigma.join(", ")}
                            {"}"}
                        </p>

                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                            Aturan aktif: {bahasaAktif.name}.
                        </p>
                    </div>
                </section>

                {/* Bagian pengujian keanggotaan */}
                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
                    <h2 className="text-xl font-semibold">
                        2. Uji keanggotaan string
                    </h2>

                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                        Masukkan string untuk memeriksa apakah string
                        tersebut termasuk dalam bahasa yang dipilih.
                    </p>

                    <label
                        htmlFor="language-string"
                        className="mb-2 mt-4 block text-sm font-medium"
                    >
                        String yang diuji
                    </label>

                    <input
                        id="language-string"
                        type="text"
                        value={inputString}
                        onChange={(event) =>
                            setInputString(event.target.value)
                        }
                        placeholder="Masukkan string, misalnya ab"
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:focus:ring-indigo-950"
                    />

                    <div
                        role="status"
                        aria-live="polite"
                        className={[
                            "mt-4 rounded-xl border p-4",
                            inputDiterima
                                ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300"
                                : "border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300",
                        ].join(" ")}
                    >
                        <p className="text-lg font-bold">
                            {inputDiterima
                                ? "✓ Anggota L"
                                : "✗ Bukan anggota L"}
                        </p>

                        <p className="mt-1 break-all font-mono text-sm">
                            String: {tampilkanString(inputString)}
                        </p>

                        <p className="mt-1 text-sm">
                            {inputDiterima
                                ? "String memenuhi aturan bahasa yang dipilih."
                                : "String tidak memenuhi aturan bahasa yang dipilih atau mengandung simbol di luar alfabet."}
                        </p>
                    </div>
                </section>

                {/* Bagian visualisasi semesta string dan anggota bahasa */}
                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
                    <h2 className="text-xl font-semibold">
                        3. Visualisasi L sebagai bagian dari Σ*
                    </h2>

                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                        Setiap kotak mewakili sebuah string dalam Σ* sampai
                        panjang maksimum yang dipilih. Warna hijau menandakan
                        anggota bahasa, sedangkan warna abu-abu menandakan
                        bukan anggota bahasa.
                    </p>

                    <div className="mt-4 max-w-xs">
                        <label
                            htmlFor="language-max-length"
                            className="mb-2 block text-sm font-medium"
                        >
                            Panjang maksimum k
                        </label>

                        <input
                            id="language-max-length"
                            type="number"
                            min={0}
                            max={BATAS_PANJANG}
                            step={1}
                            value={maxLen}
                            onChange={(event) => {
                                const nilai = Number(event.target.value);

                                if (
                                    Number.isInteger(nilai) &&
                                    nilai >= 0 &&
                                    nilai <= BATAS_PANJANG
                                ) {
                                    setMaxLen(nilai);
                                }
                            }}
                            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:focus:ring-indigo-950"
                        />
                    </div>

                    <div className="mt-4 flex flex-wrap gap-3 text-sm">
                        <span className="inline-flex items-center gap-2">
                            <span className="h-3 w-3 rounded bg-emerald-500" />
                            Anggota L ({anggotaBahasa.length})
                        </span>

                        <span className="inline-flex items-center gap-2">
                            <span className="h-3 w-3 rounded bg-slate-300 dark:bg-slate-600" />
                            Bukan anggota L (
                            {semestaString.length - anggotaBahasa.length})
                        </span>
                    </div>

                    <div
                        aria-label="Semesta Sigma bintang"
                        className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
                    >
                        {semestaString.map((teks, indeks) => {
                            const termasuk = bahasaAktif.accepts(teks);

                            return (
                                <div
                                    key={`${indeks}-${teks}`}
                                    title={
                                        termasuk
                                            ? "Anggota bahasa"
                                            : "Bukan anggota bahasa"
                                    }
                                    className={[
                                        "min-w-0 rounded-xl border p-3",
                                        termasuk
                                            ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300"
                                            : "border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-400",
                                    ].join(" ")}
                                >
                                    <p className="break-all font-mono text-lg font-bold">
                                        {tampilkanString(teks)}
                                    </p>

                                    <p className="mt-1 text-xs">
                                        {termasuk
                                            ? "Anggota L"
                                            : "Bukan anggota"}
                                    </p>
                                </div>
                            );
                        })}
                    </div>

                    <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
                        Σ* sampai panjang {maxLen} memuat{" "}
                        {semestaString.length} string, termasuk ε.
                    </p>
                </section>

                {/* Bagian bonus kuis */}
                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                                Bonus B3
                            </p>

                            <h2 className="mt-1 text-xl font-semibold">
                                Kuis Anggota atau Bukan?
                            </h2>

                            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                                Tebak apakah string acak termasuk bahasa yang aktif.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => setShowQuiz((aktif) => !aktif)}
                            className="rounded-xl bg-indigo-600 px-4 py-2.5 font-semibold text-white transition hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                        >
                            {showQuiz ? "Tutup kuis" : "Mulai kuis"}
                        </button>
                    </div>

                    {showQuiz && (
                        <div className="mt-5 border-t border-slate-200 pt-5 dark:border-slate-800">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <span className="text-sm text-slate-600 dark:text-slate-400">
                                    Bahasa: {bahasaAktif.name}
                                </span>

                                <span className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-semibold text-indigo-800 dark:bg-indigo-950 dark:text-indigo-200">
                                    Skor: {quizScore}/{quizTotal}
                                </span>
                            </div>

                            <div className="mt-4 rounded-2xl bg-slate-50 p-6 text-center dark:bg-slate-950">
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    Apakah string berikut anggota L?
                                </p>

                                <p className="mt-3 break-all font-mono text-3xl font-bold">
                                    {tampilkanString(quizQuestion)}
                                </p>
                            </div>

                            <div className="mt-4 grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    disabled={quizAnswer !== null}
                                    onClick={() => jawabKuis(true)}
                                    className="rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    ✓ Anggota L
                                </button>

                                <button
                                    type="button"
                                    disabled={quizAnswer !== null}
                                    onClick={() => jawabKuis(false)}
                                    className="rounded-xl bg-red-600 px-4 py-3 font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    ✗ Bukan anggota
                                </button>
                            </div>

                            {quizFeedback && (
                                <p
                                    role="status"
                                    aria-live="polite"
                                    className="mt-4 rounded-xl border border-slate-200 p-4 text-sm dark:border-slate-700"
                                >
                                    {quizFeedback}
                                </p>
                            )}

                            <div className="mt-4 flex flex-wrap gap-3">
                                <button
                                    type="button"
                                    disabled={quizAnswer === null}
                                    onClick={soalBerikutnya}
                                    className="rounded-xl bg-indigo-600 px-4 py-2.5 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Soal berikutnya
                                </button>

                                <button
                                    type="button"
                                    onClick={resetKuis}
                                    className="rounded-xl border border-slate-300 px-4 py-2.5 font-semibold transition hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
                                >
                                    Reset skor
                                </button>
                            </div>
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}
