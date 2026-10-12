
/**
 * Otomata Lab — Level 4
 * Simulator DFA langkah demi langkah.
 *
 * Fitur:
 * - Input string dan validasi simbol.
 * - Reset simulasi.
 * - Menjalankan satu langkah setiap kali tombol ditekan.
 * - Menjalankan simulasi secara otomatis.
 * - Menyorot simbol yang sedang dibaca.
 * - Menampilkan tabel jejak simulasi.
 * - Mengirim state aktif dan transisi terakhir ke diagram.
 *
 * Keputusan diterima atau ditolak hanya ditampilkan setelah
 * seluruh input selesai diproses.
 */

import {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    formatTrace,
    run,
    validateDFA,
    type DFA,
    type State,
    type TraceStep,
} from "../core/dfa";

interface SimulatorProps {
    dfa: DFA;
    disabled: boolean;
    onProgress: (progress: SimulationProgress) => void;
}

interface SimulationProgress {
    activeState: State | null;
    activeTransition: TraceStep | null;
}

/**
 * Mengubah string kosong menjadi simbol epsilon.
 */
function tampilkanString(input: string): string {
    return input === "" ? "ε" : input;
}

export default function Simulator({
    dfa,
    disabled,
    onProgress,
}: SimulatorProps) {
    const [input, setInput] = useState("101");
    const [langkahSaatIni, setLangkahSaatIni] = useState(0);
    const [berjalanOtomatis, setBerjalanOtomatis] = useState(false);

    /**
     * Memecah input menjadi karakter karena alfabet standar
     * pada simulator DFA Level 4 menggunakan simbol satu karakter.
     */
    const simbolInput = useMemo(
        () => Array.from(input),
        [input],
    );

    /**
     * Menghitung hasil simulasi lengkap menggunakan mesin DFA.
     * Hasil ini menjadi sumber data untuk penelusuran bertahap.
     */
    const hasilLengkap = useMemo(
        () => run(dfa, input),
        [dfa, input],
    );

    const masalahValidasi = useMemo(
        () => validateDFA(dfa),
        [dfa],
    );

    const simulasiDinonaktifkan =
        disabled || masalahValidasi.length > 0;

    const jumlahLangkah = hasilLengkap.steps.length;

    /**
     * Menentukan apakah simulasi telah selesai.
     * Jika terdapat kesalahan input, simulasi berhenti pada
     * langkah terakhir yang masih dapat dijalankan.
     */
    const selesai =
        langkahSaatIni >=
        (hasilLengkap.error
            ? jumlahLangkah
            : simbolInput.length);

    /**
     * Menentukan state yang sedang aktif pada diagram.
     */
    const stateAktif = useMemo<State | null>(() => {
        if (!dfa.states.includes(dfa.start)) {
            return null;
        }

        if (langkahSaatIni === 0) {
            return dfa.start;
        }

        return (
            hasilLengkap.steps[
                Math.min(langkahSaatIni, jumlahLangkah) - 1
            ]?.to ?? dfa.start
        );
    }, [
        dfa,
        hasilLengkap.steps,
        jumlahLangkah,
        langkahSaatIni,
    ]);

    /**
     * Mengambil transisi terakhir yang telah dilewati.
     */
    const transisiAktif = useMemo<TraceStep | null>(() => {
        if (langkahSaatIni === 0) {
            return null;
        }

        return (
            hasilLengkap.steps[
            Math.min(langkahSaatIni, jumlahLangkah) - 1
            ] ?? null
        );
    }, [
        hasilLengkap.steps,
        jumlahLangkah,
        langkahSaatIni,
    ]);

    /**
     * Menentukan indeks simbol yang sedang dibaca.
     * Apabila simbol tidak valid ditemukan, simbol tersebut
     * tetap disorot merah ketika simulasi mencapai titik kesalahan.
     */
    const indeksSimbolAktif = useMemo(() => {
        if (hasilLengkap.error) {
            return Math.min(langkahSaatIni, jumlahLangkah);
        }

        return langkahSaatIni < simbolInput.length
            ? langkahSaatIni
            : -1;
    }, [
        hasilLengkap.error,
        jumlahLangkah,
        langkahSaatIni,
        simbolInput.length,
    ]);

    /**
     * Memberi tahu DFAWorkbench mengenai state aktif dan
     * transisi terakhir agar diagram mengikuti simulasi.
     */
    useEffect(() => {
        onProgress({
            activeState: stateAktif,
            activeTransition: transisiAktif,
        });
    }, [onProgress, stateAktif, transisiAktif]);

    /**
     * Mengatur ulang simulasi ketika input atau objek DFA berubah.
     */
    useEffect(() => {
        setLangkahSaatIni(0);
        setBerjalanOtomatis(false);
    }, [input, dfa]);

    /**
     * Menjalankan satu langkah secara berkala ketika
     * pengguna memilih mode simulasi otomatis.
     */
    useEffect(() => {
        if (!berjalanOtomatis) {
            return;
        }

        if (selesai || simulasiDinonaktifkan) {
            setBerjalanOtomatis(false);
            return;
        }

        const timer = window.setTimeout(() => {
            setLangkahSaatIni((langkah) => langkah + 1);
        }, 650);

        return () => window.clearTimeout(timer);
    }, [
        berjalanOtomatis,
        selesai,
        simulasiDinonaktifkan,
        langkahSaatIni,
    ]);

    /**
     * Mengulang simulasi dari state awal.
     */
    function resetSimulasi(): void {
        setBerjalanOtomatis(false);
        setLangkahSaatIni(0);
    }

    /**
     * Menjalankan satu langkah berikutnya.
     */
    function langkahBerikutnya(): void {
        if (
            simulasiDinonaktifkan ||
            selesai ||
            langkahSaatIni >= jumlahLangkah
        ) {
            return;
        }

        setBerjalanOtomatis(false);
        setLangkahSaatIni((langkah) => langkah + 1);
    }

    /**
     * Memulai atau menghentikan simulasi otomatis.
     */
    function jalankanOtomatis(): void {
        if (simulasiDinonaktifkan || selesai) {
            return;
        }

        setBerjalanOtomatis(true);
    }

    /**
     * Menampilkan hanya langkah yang telah benar-benar
     * dilewati pada simulasi saat ini.
     */
    const langkahTerlihat = hasilLengkap.steps.slice(
        0,
        langkahSaatIni,
    );

    const tampilkanHasilAkhir =
        selesai && !simulasiDinonaktifkan;

    return (
        <div className="space-y-5">
            {/* Input string */}
            <section className="space-y-2">
                <label
                    htmlFor="dfa-simulation-input"
                    className="block text-sm font-semibold"
                >
                    String yang akan disimulasikan
                </label>

                <input
                    id="dfa-simulation-input"
                    type="text"
                    value={input}
                    disabled={simulasiDinonaktifkan}
                    onChange={(event) => {
                        setInput(event.target.value);
                    }}
                    placeholder="Contoh: 101"
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-mono outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:focus:ring-indigo-950"
                />

                <p className="text-xs text-slate-500 dark:text-slate-400">
                    String kosong dapat diuji dengan mengosongkan input.
                    String kosong direpresentasikan oleh ε.
                </p>
            </section>

            {/* Kontrol simulasi */}
            <div className="flex flex-wrap gap-2">
                <button
                    type="button"
                    onClick={resetSimulasi}
                    disabled={simulasiDinonaktifkan}
                    className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:hover:bg-slate-800"
                >
                    ⏮ Reset
                </button>

                <button
                    type="button"
                    onClick={langkahBerikutnya}
                    disabled={
                        simulasiDinonaktifkan ||
                        selesai ||
                        langkahSaatIni >= jumlahLangkah
                    }
                    className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    ⏭ Langkah berikutnya
                </button>

                <button
                    type="button"
                    onClick={jalankanOtomatis}
                    disabled={
                        simulasiDinonaktifkan ||
                        selesai ||
                        berjalanOtomatis
                    }
                    className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    ▶ Jalankan otomatis
                </button>

                {berjalanOtomatis && (
                    <button
                        type="button"
                        onClick={() => setBerjalanOtomatis(false)}
                        className="rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-600"
                    >
                        Jeda
                    </button>
                )}
            </div>

            {/* Peringatan jika simulasi tidak dapat dijalankan */}
            {simulasiDinonaktifkan && (
                <div
                    role="alert"
                    className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200"
                >
                    Simulasi tidak dapat dijalankan karena struktur DFA
                    belum valid. Perbaiki state awal, state akhir, atau
                    transisi yang bermasalah terlebih dahulu.
                </div>
            )}

            {/* Pita input */}
            <section className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-semibold">Pita input</h3>

                    <span className="text-sm text-slate-500 dark:text-slate-400">
                        Langkah {Math.min(langkahSaatIni, jumlahLangkah)} dari{" "}
                        {jumlahLangkah}
                    </span>
                </div>

                <div className="mt-3 flex min-h-14 flex-wrap items-center gap-2">
                    {simbolInput.length === 0 ? (
                        <span className="rounded-lg bg-indigo-50 px-4 py-2 font-mono text-lg font-bold text-indigo-800 dark:bg-indigo-950 dark:text-indigo-200">
                            ε
                        </span>
                    ) : (
                        simbolInput.map((simbol, indeks) => {
                            const sedangDibaca = indeks === indeksSimbolAktif;

                            const simbolError =
                                Boolean(hasilLengkap.error) &&
                                indeks === jumlahLangkah &&
                                langkahSaatIni >= jumlahLangkah;

                            return (
                                <span
                                    key={`${indeks}-${simbol}`}
                                    className={[
                                        "inline-flex min-w-10 justify-center rounded-lg border px-3 py-2 font-mono text-lg font-bold transition",
                                        simbolError
                                            ? "border-red-500 bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200"
                                            : sedangDibaca
                                                ? "border-amber-500 bg-amber-100 text-amber-900 ring-2 ring-amber-300 dark:bg-amber-950 dark:text-amber-100"
                                                : indeks < langkahSaatIni
                                                    ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300"
                                                    : "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300",
                                    ].join(" ")}
                                >
                                    {simbol}
                                </span>
                            );
                        })
                    )}
                </div>

                <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500 dark:text-slate-400">
                    <span>🟠 Simbol sedang dibaca</span>
                    <span>🟢 Simbol yang sudah dibaca</span>
                    <span>🔴 Simbol bermasalah</span>
                </div>
            </section>

            {/* Status simulasi saat ini */}
            <section className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        State aktif
                    </p>

                    <p className="mt-2 break-all font-mono text-2xl font-bold">
                        {stateAktif ?? "Tidak tersedia"}
                    </p>
                </div>

                <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Simbol berikutnya
                    </p>

                    <p className="mt-2 break-all font-mono text-2xl font-bold">
                        {indeksSimbolAktif >= 0 &&
                            indeksSimbolAktif < simbolInput.length
                            ? simbolInput[indeksSimbolAktif]
                            : "—"}
                    </p>
                </div>
            </section>

            {/* Tabel jejak langkah yang telah dijalankan */}
            <section>
                <h3 className="font-semibold">Tabel jejak simulasi</h3>

                <div className="mt-3 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
                    <table className="w-full min-w-[520px] border-collapse text-left text-sm">
                        <thead className="bg-slate-100 dark:bg-slate-800">
                            <tr>
                                <th className="px-4 py-3">Langkah</th>
                                <th className="px-4 py-3">State asal</th>
                                <th className="px-4 py-3">Simbol</th>
                                <th className="px-4 py-3">State tujuan</th>
                            </tr>
                        </thead>

                        <tbody>
                            {langkahTerlihat.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={4}
                                        className="px-4 py-6 text-center text-slate-500 dark:text-slate-400"
                                    >
                                        Belum ada transisi yang dijalankan.
                                    </td>
                                </tr>
                            ) : (
                                langkahTerlihat.map((langkah) => (
                                    <tr
                                        key={langkah.step}
                                        className={[
                                            "border-t border-slate-200 dark:border-slate-700",
                                            langkah.step === langkahSaatIni
                                                ? "bg-amber-50 dark:bg-amber-950/30"
                                                : "",
                                        ].join(" ")}
                                    >
                                        <td className="px-4 py-3 tabular-nums">
                                            {langkah.step}
                                        </td>

                                        <td className="px-4 py-3 font-mono">
                                            {langkah.from}
                                        </td>

                                        <td className="px-4 py-3 font-mono">
                                            {langkah.symbol}
                                        </td>

                                        <td className="px-4 py-3 font-mono">
                                            {langkah.to}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Hasil akhir hanya muncul setelah input selesai diproses */}
            {tampilkanHasilAkhir && (
                <section
                    role="status"
                    aria-live="polite"
                    className={[
                        "rounded-2xl border p-5",
                        hasilLengkap.error
                            ? "border-red-300 bg-red-50 dark:border-red-900 dark:bg-red-950/40"
                            : hasilLengkap.accepted
                                ? "border-emerald-300 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/40"
                                : "border-red-300 bg-red-50 dark:border-red-900 dark:bg-red-950/40",
                    ].join(" ")}
                >
                    <h3 className="text-xl font-bold">
                        {hasilLengkap.error
                            ? "⚠ Simulasi berhenti karena kesalahan"
                            : hasilLengkap.accepted
                                ? "✅ DITERIMA"
                                : "❌ DITOLAK"}
                    </h3>

                    {hasilLengkap.error && (
                        <p className="mt-2 break-words text-sm text-red-800 dark:text-red-200">
                            {hasilLengkap.error}
                        </p>
                    )}

                    <p className="mt-3 text-sm">
                        State akhir simulasi:{" "}
                        <span className="font-mono font-bold">
                            {hasilLengkap.finalState}
                        </span>
                    </p>

                    <div className="mt-4 rounded-xl bg-white/80 p-4 dark:bg-slate-950/60">
                        <p className="text-sm font-semibold">
                            Jejak ringkas
                        </p>

                        <p className="mt-2 break-all font-mono text-sm">
                            {formatTrace(hasilLengkap)}
                        </p>
                    </div>
                </section>
            )}

            {!selesai && !simulasiDinonaktifkan && (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    Simulasi belum selesai. Keputusan akhir hanya
                    diberikan setelah seluruh input selesai dibaca.
                </p>
            )}

            {/* Menyediakan informasi ketika input tidak bisa diproses */}
            {hasilLengkap.error &&
                langkahSaatIni >= jumlahLangkah &&
                !simulasiDinonaktifkan &&
                !selesai && (
                    <p className="text-sm text-red-600 dark:text-red-300">
                        {hasilLengkap.error}
                    </p>
                )}

            {/* Menampilkan simbol epsilon secara konsisten */}
            <p className="text-xs text-slate-500 dark:text-slate-400">
                Input: {tampilkanString(input)}
            </p>
        </div>
    );
}
