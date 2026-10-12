
/**
 * Otomata Lab — Level 1
 * Antarmuka interaktif untuk alfabet dan string.
 *
 * Seluruh perhitungan menggunakan fungsi dari core/alphabet.ts.
 */

import { useMemo, useState } from "react";

import {
    parseAlphabet,
    isValidString,
    length,
    concat,
    sigmaN,
    sigmaStar,
    type Alphabet,
} from "../core/alphabet";

/**
 * Batas generator digunakan untuk menjaga jumlah hasil
 * tetap nyaman ditampilkan pada antarmuka.
 */
const BATAS_PANJANG_GENERATOR = 4;

/**
 * Menampilkan string kosong sebagai simbol epsilon.
 */
function tampilkanString(teks: string): string {
    return teks === "" ? "ε" : teks;
}

/**
 * Mewakili hasil parsing alfabet, termasuk pesan kesalahan.
 */
interface HasilParsing {
    alfabet: Alphabet | null;
    kesalahan: string | null;
}

export default function AlphabetPlayground() {
    const [inputAlfabet, setInputAlfabet] = useState("a, b");
    const [inputString, setInputString] = useState("abba");

    const [stringW, setStringW] = useState("ab");
    const [stringV, setStringV] = useState("bb");

    const [nilaiN, setNilaiN] = useState(2);
    const [nilaiK, setNilaiK] = useState(2);

    /**
     * Menghitung alfabet yang valid setiap kali input berubah.
     * Kesalahan parsing ditampilkan tanpa menghentikan komponen.
     */
    const hasilParsing = useMemo<HasilParsing>(() => {
        try {
            return {
                alfabet: parseAlphabet(inputAlfabet),
                kesalahan: null,
            };
        } catch (kesalahan: unknown) {
            return {
                alfabet: null,
                kesalahan:
                    kesalahan instanceof Error
                        ? kesalahan.message
                        : "Alfabet tidak dapat diproses.",
            };
        }
    }, [inputAlfabet]);

    const alfabet = hasilParsing.alfabet;
    const alfabetValid = alfabet !== null;

    /**
     * Memeriksa keanggotaan string berdasarkan alfabet aktif.
     */
    const stringValid = useMemo(() => {
        if (!alfabet) {
            return false;
        }

        return isValidString(inputString, alfabet);
    }, [inputString, alfabet]);

    /**
     * Memisahkan string menjadi simbol individual agar setiap
     * simbol dapat diberi warna sesuai hasil validasi.
     */
    const simbolString = useMemo(() => {
        const simbol = Array.from(inputString);

        if (!alfabet) {
            return simbol.map((karakter) => ({
                karakter,
                valid: false,
            }));
        }

        return simbol.map((karakter) => ({
            karakter,
            valid: alfabet.includes(karakter),
        }));
    }, [inputString, alfabet]);

    /**
     * Menghasilkan Sigma pangkat n.
     */
    const hasilSigmaN = useMemo(() => {
        if (!alfabetValid || !alfabet) {
            return [];
        }

        return sigmaN(alfabet, nilaiN);
    }, [alfabet, alfabetValid, nilaiN]);

    /**
     * Menghasilkan Sigma bintang sampai panjang maksimum k.
     */
    const hasilSigmaStar = useMemo(() => {
        if (!alfabetValid || !alfabet) {
            return [];
        }

        return sigmaStar(alfabet, nilaiK);
    }, [alfabet, alfabetValid, nilaiK]);

    const konkatenasiWV = concat(stringW, stringV);
    const konkatenasiVW = concat(stringV, stringW);

    return (
        <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 dark:bg-slate-950 dark:text-slate-100 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-6xl space-y-6">
                <header className="space-y-2">
                    <p className="text-sm font-semibold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                        Level 1 · Teori Bahasa dan Otomata
                    </p>

                    <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                        Alfabet &amp; String Playground
                    </h1>

                    <p className="max-w-3xl text-slate-600 dark:text-slate-400">
                        Pelajari alfabet, string, panjang string, konkatenasi,
                        serta pembentukan himpunan string menggunakan
                        notasi matematika bahasa formal.
                    </p>
                </header>

                {/* Bagian input dan validasi alfabet */}
                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
                    <div className="mb-4">
                        <h2 className="text-xl font-semibold">
                            1. Alfabet Σ
                        </h2>

                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                            Masukkan simbol yang dipisahkan dengan koma.
                            Setiap simbol harus terdiri dari satu karakter.
                        </p>
                    </div>

                    <label
                        htmlFor="alphabet-input"
                        className="mb-2 block text-sm font-medium"
                    >
                        Input alfabet
                    </label>

                    <input
                        id="alphabet-input"
                        type="text"
                        value={inputAlfabet}
                        onChange={(event) =>
                            setInputAlfabet(event.target.value)
                        }
                        placeholder="Contoh: a, b"
                        aria-invalid={!alfabetValid}
                        aria-describedby="alphabet-feedback"
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:focus:ring-indigo-950"
                    />

                    <div
                        id="alphabet-feedback"
                        aria-live="polite"
                        className="mt-3 text-sm"
                    >
                        {hasilParsing.kesalahan ? (
                            <p
                                role="alert"
                                className="rounded-lg bg-red-50 p-3 text-red-700 dark:bg-red-950/40 dark:text-red-300"
                            >
                                {hasilParsing.kesalahan}
                            </p>
                        ) : (
                            <div className="rounded-lg bg-emerald-50 p-3 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                                <p className="font-semibold">
                                    Σ = {"{"}
                                    {alfabet?.join(", ")}
                                    {"}"}
                                </p>

                                <p className="mt-1">
                                    Alfabet valid dengan {alfabet?.length} simbol.
                                </p>
                            </div>
                        )}
                    </div>
                </section>

                {/* Bagian validasi string dan panjang string */}
                <div className="grid gap-6 lg:grid-cols-2">
                    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
                        <h2 className="text-xl font-semibold">
                            2. Validasi string
                        </h2>

                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                            Simbol yang tidak termasuk dalam alfabet akan
                            ditampilkan dengan warna merah.
                        </p>

                        <label
                            htmlFor="string-input"
                            className="mb-2 mt-4 block text-sm font-medium"
                        >
                            String w
                        </label>

                        <input
                            id="string-input"
                            type="text"
                            value={inputString}
                            onChange={(event) =>
                                setInputString(event.target.value)
                            }
                            placeholder="Masukkan string"
                            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:focus:ring-indigo-950"
                        />

                        <div className="mt-4 space-y-2">
                            <p className="text-sm font-medium">
                                Pratinjau simbol
                            </p>

                            <div
                                aria-label="Pratinjau validasi string"
                                className="flex min-h-14 flex-wrap items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-950"
                            >
                                {simbolString.length === 0 ? (
                                    <span className="text-xl font-semibold text-indigo-600 dark:text-indigo-400">
                                        ε
                                    </span>
                                ) : (
                                    simbolString.map((item, indeks) => (
                                        <span
                                            key={`${indeks}-${item.karakter}`}
                                            className={[
                                                "inline-flex min-w-8 justify-center rounded-md px-2 py-1 font-mono text-lg font-semibold",
                                                item.valid
                                                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                                                    : "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
                                            ].join(" ")}
                                        >
                                            {item.karakter}
                                        </span>
                                    ))
                                )}
                            </div>

                            {alfabetValid && (
                                <p
                                    role="status"
                                    className={
                                        stringValid
                                            ? "rounded-lg bg-emerald-50 p-3 text-sm font-medium text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                                            : "rounded-lg bg-red-50 p-3 text-sm font-medium text-red-700 dark:bg-red-950/40 dark:text-red-300"
                                    }
                                >
                                    {stringValid
                                        ? "✓ String valid: seluruh simbol termasuk dalam Σ."
                                        : "✗ String tidak valid: terdapat simbol di luar Σ."}
                                </p>
                            )}
                        </div>
                    </section>

                    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
                        <h2 className="text-xl font-semibold">
                            3. Panjang string
                        </h2>

                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                            Panjang string dihitung dari jumlah simbol
                            yang menyusunnya.
                        </p>

                        <div className="mt-5 rounded-xl bg-indigo-50 p-6 dark:bg-indigo-950/40">
                            <p className="text-sm text-indigo-700 dark:text-indigo-300">
                                String w
                            </p>

                            <p className="mt-1 break-all font-mono text-2xl font-bold">
                                {tampilkanString(inputString)}
                            </p>

                            <div className="mt-5 border-t border-indigo-200 pt-4 dark:border-indigo-800">
                                <p className="text-sm text-indigo-700 dark:text-indigo-300">
                                    Panjang string |w|
                                </p>

                                <p className="mt-1 text-4xl font-bold tabular-nums">
                                    {length(inputString)}
                                </p>
                            </div>
                        </div>

                        <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
                            String kosong direpresentasikan oleh ε dan
                            memiliki panjang 0.
                        </p>
                    </section>
                </div>

                {/* Bagian konkatenasi */}
                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
                    <h2 className="text-xl font-semibold">
                        4. Konkatenasi string
                    </h2>

                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                        Bandingkan w·v dengan v·w. Urutan penggabungan
                        dapat menghasilkan string yang berbeda.
                    </p>

                    <div className="mt-5 grid gap-4 sm:grid-cols-2">
                        <div>
                            <label
                                htmlFor="string-w"
                                className="mb-2 block text-sm font-medium"
                            >
                                String w
                            </label>

                            <input
                                id="string-w"
                                type="text"
                                value={stringW}
                                onChange={(event) =>
                                    setStringW(event.target.value)
                                }
                                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:focus:ring-indigo-950"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="string-v"
                                className="mb-2 block text-sm font-medium"
                            >
                                String v
                            </label>

                            <input
                                id="string-v"
                                type="text"
                                value={stringV}
                                onChange={(event) =>
                                    setStringV(event.target.value)
                                }
                                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:focus:ring-indigo-950"
                            />
                        </div>
                    </div>

                    <div className="mt-5 grid gap-4 sm:grid-cols-2">
                        <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-950">
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                w · v
                            </p>

                            <p className="mt-2 break-all font-mono text-2xl font-bold">
                                {tampilkanString(konkatenasiWV)}
                            </p>
                        </div>

                        <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-950">
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                v · w
                            </p>

                            <p className="mt-2 break-all font-mono text-2xl font-bold">
                                {tampilkanString(konkatenasiVW)}
                            </p>
                        </div>
                    </div>

                    <p
                        role="status"
                        className="mt-4 rounded-xl border border-slate-200 p-4 text-sm dark:border-slate-700"
                    >
                        {konkatenasiWV === konkatenasiVW
                            ? "Kedua hasil konkatenasi sama."
                            : "Kedua hasil konkatenasi berbeda. Konkatenasi tidak selalu komutatif."}
                    </p>

                    <div className="mt-4 rounded-xl bg-emerald-50 p-4 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                        <p className="font-semibold">
                            Identitas epsilon
                        </p>

                        <p className="mt-1 break-all font-mono">
                            w · ε = {tampilkanString(stringW)} · ε ={" "}
                            {tampilkanString(concat(stringW, ""))}
                        </p>

                        <p className="mt-1 text-sm">
                            Menggabungkan string dengan string kosong
                            tidak mengubah string awal.
                        </p>
                    </div>
                </section>

                {/* Bagian generator Sigma pangkat n */}
                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
                    <h2 className="text-xl font-semibold">
                        5. Generator Σⁿ
                    </h2>

                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                        Hasilkan seluruh string dengan panjang tepat n.
                    </p>

                    <div className="mt-4 max-w-xs">
                        <label
                            htmlFor="sigma-n"
                            className="mb-2 block text-sm font-medium"
                        >
                            Panjang n
                        </label>

                        <input
                            id="sigma-n"
                            type="number"
                            min={0}
                            max={BATAS_PANJANG_GENERATOR}
                            step={1}
                            value={nilaiN}
                            onChange={(event) => {
                                const nilai = Number(event.target.value);

                                if (
                                    Number.isInteger(nilai) &&
                                    nilai >= 0 &&
                                    nilai <= BATAS_PANJANG_GENERATOR
                                ) {
                                    setNilaiN(nilai);
                                }
                            }}
                            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:focus:ring-indigo-950"
                        />
                    </div>

                    {alfabetValid ? (
                        <>
                            <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
                                Banyak hasil: {hasilSigmaN.length}
                            </p>

                            <div
                                aria-label="Hasil generator Sigma pangkat n"
                                className="mt-3 flex flex-wrap gap-2"
                            >
                                {hasilSigmaN.map((teks, indeks) => (
                                    <span
                                        key={`${indeks}-${teks}`}
                                        className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 font-mono text-sm font-semibold text-indigo-800 dark:border-indigo-800 dark:bg-indigo-950 dark:text-indigo-200"
                                    >
                                        {tampilkanString(teks)}
                                    </span>
                                ))}
                            </div>
                        </>
                    ) : (
                        <p className="mt-4 text-sm text-red-600 dark:text-red-400">
                            Perbaiki alfabet terlebih dahulu.
                        </p>
                    )}
                </section>

                {/* Bagian generator Sigma bintang */}
                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
                    <h2 className="text-xl font-semibold">
                        6. Generator Σ*
                    </h2>

                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                        Tampilkan seluruh string dari panjang nol sampai
                        batas maksimum k. Untuk mencegah hasil berlebihan,
                        nilai k dibatasi sampai {BATAS_PANJANG_GENERATOR}.
                    </p>

                    <div className="mt-4 max-w-xs">
                        <label
                            htmlFor="sigma-k"
                            className="mb-2 block text-sm font-medium"
                        >
                            Panjang maksimum k
                        </label>

                        <input
                            id="sigma-k"
                            type="number"
                            min={0}
                            max={BATAS_PANJANG_GENERATOR}
                            step={1}
                            value={nilaiK}
                            onChange={(event) => {
                                const nilai = Number(event.target.value);

                                if (
                                    Number.isInteger(nilai) &&
                                    nilai >= 0 &&
                                    nilai <= BATAS_PANJANG_GENERATOR
                                ) {
                                    setNilaiK(nilai);
                                }
                            }}
                            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:focus:ring-indigo-950"
                        />
                    </div>

                    {alfabetValid ? (
                        <>
                            <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
                                Total hasil: {hasilSigmaStar.length} string
                            </p>

                            <div
                                aria-label="Hasil generator Sigma bintang"
                                className="mt-3 flex flex-wrap gap-2"
                            >
                                {hasilSigmaStar.map((teks, indeks) => (
                                    <span
                                        key={`${indeks}-${teks}`}
                                        className={
                                            teks === ""
                                                ? "rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 font-mono text-sm font-semibold text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200"
                                                : "rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-sm font-semibold dark:border-slate-700 dark:bg-slate-950"
                                        }
                                    >
                                        {tampilkanString(teks)}
                                    </span>
                                ))}
                            </div>

                            <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
                                Urutan dimulai dari ε, kemudian string sepanjang
                                satu simbol, dua simbol, dan seterusnya sampai k.
                            </p>
                        </>
                    ) : (
                        <p className="mt-4 text-sm text-red-600 dark:text-red-400">
                            Perbaiki alfabet terlebih dahulu.
                        </p>
                    )}
                </section>
            </div>
        </main>
    );
}
