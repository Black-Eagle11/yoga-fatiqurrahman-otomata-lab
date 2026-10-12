
/**
 * Otomata Lab — Level 4
 * Penguji massal string pada DFA.
 *
 * Fitur:
 * - Menerima daftar kasus uji, satu kasus per baris.
 * - Membandingkan hasil aktual dengan harapan pengguna.
 * - Menampilkan trace setiap string.
 * - Menghitung jumlah pengujian yang cocok.
 * - Memperingatkan jika epsilon belum diuji.
 * - Memperingatkan jika jumlah contoh diterima atau ditolak
 *   belum mencapai tiga kasus.
 *
 * Format input:
 * 101 ✓
 * 110 ✗
 * ε   ✗
 */

import {
    useMemo,
    useState,
} from "react";

import {
    formatTrace,
    run,
    runSymbols,
    validateDFA,
    type DFA,
    type RunResult,
} from "../core/dfa";

interface TestRunnerProps {
    dfa: DFA;
    disabled: boolean;
}

interface ParsedTestCase {
    line: number;
    input: string;
    symbols: string[];
    expected: boolean;
}

interface ParseIssue {
    line: number;
    message: string;
}

interface ParseResult {
    cases: ParsedTestCase[];
    issues: ParseIssue[];
}

interface TestResultRow {
    testCase: ParsedTestCase;
    result: RunResult;
    matches: boolean;
}

/**
 * Menampilkan string kosong sebagai epsilon.
 */
function tampilkanString(input: string): string {
    return input === "" ? "ε" : input;
}

/**
 * Menerjemahkan simbol harapan menjadi nilai boolean.
 *
 * Variasi yang diterima:
 * Diterima: ✓, ✔, ✅, +, ya, true, accept, accepted
 * Ditolak: ✗, ✘, ❌, -, tidak, false, reject, rejected
 */
function parseHarapan(token: string): boolean | null {
    const nilai = token.trim().toLocaleLowerCase("id-ID");

    const diterima = new Set([
        "✓",
        "✔",
        "✅",
        "+",
        "ya",
        "true",
        "1",
        "terima",
        "diterima",
        "accept",
        "accepted",
    ]);

    const ditolak = new Set([
        "✗",
        "✘",
        "❌",
        "-",
        "tidak",
        "false",
        "0",
        "tolak",
        "ditolak",
        "reject",
        "rejected",
        "x",
    ]);

    if (diterima.has(nilai)) {
        return true;
    }

    if (ditolak.has(nilai)) {
        return false;
    }

    return null;
}

/**
 * Mengenali notasi epsilon yang dapat digunakan pada
 * daftar kasus uji.
 */
function adalahEpsilon(input: string): boolean {
    const nilai = input.trim().toLocaleLowerCase("id-ID");

    return (
        nilai === "ε" ||
        nilai === "epsilon" ||
        nilai === "eps" ||
        nilai === '""' ||
        nilai === "<epsilon>"
    );
}

/**
 * Mengurai daftar tes dari teks pengguna.
 *
 * Untuk alfabet satu karakter, karakter input digabung
 * sehingga format "a b ✓" juga menjadi string "ab".
 *
 * Untuk alfabet dengan simbol multi-karakter, setiap simbol
 * harus dipisahkan menggunakan spasi.
 */
function parseDaftarTes(
    teks: string,
    dfa: DFA,
): ParseResult {
    const cases: ParsedTestCase[] = [];
    const issues: ParseIssue[] = [];

    const memilikiSimbolPanjang = dfa.alphabet.some(
        (simbol) => Array.from(simbol).length !== 1,
    );

    const lines = teks.split(/\r?\n/);

    lines.forEach((baris, index) => {
        const isi = baris.trim();

        // Baris kosong tidak dianggap sebagai kasus uji.
        if (isi === "") {
            return;
        }

        const tokens = isi.split(/\s+/);

        if (tokens.length < 2) {
            issues.push({
                line: index + 1,
                message:
                    "Setiap baris harus memuat string dan harapan, misalnya ab ✓.",
            });

            return;
        }

        const expected = parseHarapan(tokens[tokens.length - 1]!);

        if (expected === null) {
            issues.push({
                line: index + 1,
                message:
                    "Harapan tidak dikenali. Gunakan ✓ untuk diterima atau ✗ untuk ditolak.",
            });

            return;
        }

        const inputMentah = tokens.slice(0, -1).join(" ").trim();

        if (inputMentah === "") {
            issues.push({
                line: index + 1,
                message: "Input string tidak boleh kosong. Gunakan ε untuk string kosong.",
            });

            return;
        }

        let symbols: string[];

        if (adalahEpsilon(inputMentah)) {
            symbols = [];
        } else if (memilikiSimbolPanjang) {
            symbols = inputMentah.split(/\s+/);
        } else {
            symbols = Array.from(inputMentah.replace(/\s+/g, ""));
        }

        const input = memilikiSimbolPanjang
            ? symbols.join(" ")
            : symbols.join("");

        cases.push({
            line: index + 1,
            input,
            symbols,
            expected,
        });
    });

    return {
        cases,
        issues,
    };
}

/**
 * Menjalankan satu kasus berdasarkan jenis alfabet DFA.
 *
 * Simbol satu karakter diproses menggunakan run().
 * Simbol multi-karakter diproses menggunakan runSymbols().
 */
function jalankanKasus(
    dfa: DFA,
    testCase: ParsedTestCase,
): RunResult {
    const memilikiSimbolPanjang = dfa.alphabet.some(
        (simbol) => Array.from(simbol).length !== 1,
    );

    if (memilikiSimbolPanjang) {
        return runSymbols(dfa, testCase.symbols);
    }

    return run(dfa, testCase.input);
}

export default function TestRunner({
    dfa,
    disabled,
}: TestRunnerProps) {
    const [inputTes, setInputTes] = useState("");
    const [sudahDijalankan, setSudahDijalankan] = useState(false);

    const masalahValidasi = useMemo(
        () => validateDFA(dfa),
        [dfa],
    );

    const tesDinonaktifkan =
        disabled || masalahValidasi.length > 0;

    /**
     * Mem-parsing teks pengujian ketika daftar kasus berubah.
     */
    const hasilParsing = useMemo(
        () => parseDaftarTes(inputTes, dfa),
        [inputTes, dfa],
    );

    /**
     * Menjalankan seluruh kasus dan membandingkan hasil aktual
     * dengan harapan yang ditulis oleh pengguna.
     */
    const hasilTes = useMemo<TestResultRow[]>(() => {
        return hasilParsing.cases.map((testCase) => {
            const result = jalankanKasus(dfa, testCase);

            const matches =
                result.error === undefined &&
                result.accepted === testCase.expected;

            return {
                testCase,
                result,
                matches,
            };
        });
    }, [hasilParsing, dfa]);

    /**
     * Menghitung statistik daftar pengujian.
     */
    const jumlahDiharapkanDiterima =
        hasilParsing.cases.filter(
            (testCase) => testCase.expected,
        ).length;

    const jumlahDiharapkanDitolak =
        hasilParsing.cases.filter(
            (testCase) => !testCase.expected,
        ).length;

    const epsilonSudahDiuji = hasilParsing.cases.some(
        (testCase) => testCase.symbols.length === 0,
    );

    const jumlahCocok = hasilTes.filter(
        (item) => item.matches,
    ).length;

    const jumlahTidakCocok = hasilTes.filter(
        (item) => !item.matches,
    ).length;

    const jumlahErrorInput = hasilTes.filter(
        (item) => item.result.error !== undefined,
    ).length;

    /**
     * Menghapus status hasil pengujian ketika daftar diedit.
     */
    function ubahDaftarTes(nilai: string): void {
        setInputTes(nilai);
        setSudahDijalankan(false);
    }

    /**
     * Mengizinkan pengujian dilakukan jika DFA valid
     * dan setidaknya ada satu kasus yang berhasil diurai.
     */
    function jalankanSemuaTes(): void {
        if (tesDinonaktifkan || hasilParsing.cases.length === 0) {
            return;
        }

        setSudahDijalankan(true);
    }

    return (
        <div className="space-y-5">
            {/* Petunjuk format kasus uji */}
            <section>
                <h3 className="font-semibold">
                    Daftar kasus uji
                </h3>

                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                    Tulis satu string per baris, diikuti harapan diterima
                    atau ditolak. String kosong ditulis sebagai ε.
                </p>

                <div className="mt-3 rounded-xl bg-slate-50 p-4 font-mono text-sm dark:bg-slate-950">
                    <p>101 ✓</p>
                    <p>110 ✗</p>
                    <p>1 ✓</p>
                    <p>0 ✗</p>
                    <p>ε ✗</p>
                </div>

                <label
                    htmlFor="dfa-mass-test-input"
                    className="mb-2 mt-4 block text-sm font-medium"
                >
                    Input pengujian
                </label>

                <textarea
                    id="dfa-mass-test-input"
                    value={inputTes}
                    onChange={(event) =>
                        ubahDaftarTes(event.target.value)
                    }
                    placeholder={
                        "101 ✓\n110 ✗\n1 ✓\n0 ✗\nε ✗"
                    }
                    rows={8}
                    spellCheck={false}
                    className="w-full resize-y rounded-xl border border-slate-300 bg-white px-4 py-3 font-mono text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:focus:ring-indigo-950"
                />
            </section>

            {/* Ringkasan cakupan kasus uji */}
            <section className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Diharapkan diterima
                    </p>

                    <p className="mt-1 text-2xl font-bold">
                        {jumlahDiharapkanDiterima}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                        Target minimal 3
                    </p>
                </div>

                <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Diharapkan ditolak
                    </p>

                    <p className="mt-1 text-2xl font-bold">
                        {jumlahDiharapkanDitolak}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                        Target minimal 3
                    </p>
                </div>

                <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        String kosong
                    </p>

                    <p className="mt-1 text-2xl font-bold">
                        {epsilonSudahDiuji ? "✓" : "—"}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                        ε wajib diuji
                    </p>
                </div>
            </section>

            {/* Kesalahan format baris */}
            {hasilParsing.issues.length > 0 && (
                <section
                    role="alert"
                    className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/30"
                >
                    <h3 className="font-semibold text-red-800 dark:text-red-300">
                        Baris yang perlu diperbaiki
                    </h3>

                    <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-red-700 dark:text-red-200">
                        {hasilParsing.issues.map((masalah) => (
                            <li key={`${masalah.line}-${masalah.message}`}>
                                Baris {masalah.line}: {masalah.message}
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            {/* Peringatan cakupan pengujian */}
            {hasilParsing.cases.length > 0 && (
                <section
                    className="space-y-2"
                    aria-live="polite"
                >
                    {!epsilonSudahDiuji && (
                        <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
                            ⚠ Daftar tes belum memuat ε. Tambahkan pengujian
                            string kosong sesuai instruksi tugas.
                        </p>
                    )}

                    {jumlahDiharapkanDiterima < 3 && (
                        <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
                            ⚠ Tambahkan setidaknya{" "}
                            {3 - jumlahDiharapkanDiterima} kasus yang diharapkan
                            diterima agar mencapai target minimal tiga.
                        </p>
                    )}

                    {jumlahDiharapkanDitolak < 3 && (
                        <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
                            ⚠ Tambahkan setidaknya{" "}
                            {3 - jumlahDiharapkanDitolak} kasus yang diharapkan
                            ditolak agar mencapai target minimal tiga.
                        </p>
                    )}
                </section>
            )}

            {/* Tombol menjalankan semua kasus */}
            <button
                type="button"
                onClick={jalankanSemuaTes}
                disabled={
                    tesDinonaktifkan ||
                    hasilParsing.cases.length === 0
                }
                className="rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
                ▶ Jalankan semua tes
            </button>

            {tesDinonaktifkan && (
                <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200">
                    Pengujian dinonaktifkan karena DFA belum valid.
                    Perbaiki kesalahan pada tabel transisi terlebih dahulu.
                </p>
            )}

            {/* Hasil pengujian massal */}
            {sudahDijalankan && (
                <section className="space-y-4">
                    <div
                        role="status"
                        aria-live="polite"
                        className={[
                            "rounded-xl border p-4",
                            jumlahTidakCocok === 0 &&
                                hasilParsing.issues.length === 0
                                ? "border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/30"
                                : "border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30",
                        ].join(" ")}
                    >
                        <h3 className="font-semibold">
                            Hasil pengujian
                        </h3>

                        <p className="mt-1 text-sm">
                            {jumlahCocok} dari {hasilTes.length} kasus uji cocok
                            dengan harapan.
                        </p>

                        {jumlahTidakCocok > 0 && (
                            <p className="mt-1 text-sm">
                                {jumlahTidakCocok} kasus membutuhkan pemeriksaan
                                lebih lanjut.
                            </p>
                        )}

                        {jumlahErrorInput > 0 && (
                            <p className="mt-1 text-sm">
                                {jumlahErrorInput} kasus mengalami kesalahan input
                                atau transisi.
                            </p>
                        )}
                    </div>

                    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
                        <table className="w-full min-w-[760px] border-collapse text-left text-sm">
                            <thead className="bg-slate-100 dark:bg-slate-800">
                                <tr>
                                    <th className="px-4 py-3">String</th>
                                    <th className="px-4 py-3">Harapan</th>
                                    <th className="px-4 py-3">Hasil aktual</th>
                                    <th className="px-4 py-3">Jejak</th>
                                    <th className="px-4 py-3">Status</th>
                                </tr>
                            </thead>

                            <tbody>
                                {hasilTes.map((item) => {
                                    const hasilAktual = item.result.error
                                        ? "Error"
                                        : item.result.accepted
                                            ? "Diterima"
                                            : "Ditolak";

                                    const status = item.result.error
                                        ? "⚠ Error"
                                        : item.matches
                                            ? "✓ Cocok"
                                            : "✗ Tidak cocok";

                                    return (
                                        <tr
                                            key={item.testCase.line}
                                            className="border-t border-slate-200 align-top dark:border-slate-700"
                                        >
                                            <td className="px-4 py-3 font-mono">
                                                {tampilkanString(item.testCase.input)}
                                            </td>

                                            <td className="px-4 py-3">
                                                {item.testCase.expected
                                                    ? "Diterima"
                                                    : "Ditolak"}
                                            </td>

                                            <td className="px-4 py-3">
                                                {hasilAktual}
                                            </td>

                                            <td className="max-w-md break-words px-4 py-3 font-mono text-xs">
                                                {formatTrace(item.result)}
                                            </td>

                                            <td className="px-4 py-3">
                                                <span
                                                    className={
                                                        item.matches
                                                            ? "font-semibold text-emerald-700 dark:text-emerald-300"
                                                            : "font-semibold text-red-700 dark:text-red-300"
                                                    }
                                                >
                                                    {status}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </section>
            )}
        </div>
    );
}
