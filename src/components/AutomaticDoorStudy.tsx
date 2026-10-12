
/**
 * Otomata Lab — Level 5
 * Studi kasus DFA: Pintu Otomatis.
 *
 * State:
 * - Tertutup
 * - Terbuka
 *
 * Event:
 * - ADA_ORANG
 * - TIDAK_ADA_ORANG
 *
 * Komponen menggunakan mesin DFA dari automaticDoor.ts
 * agar simulasi visual dan logika automata tetap konsisten.
 */

import { useState } from "react";

import {
    DOOR_EVENTS,
    automaticDoorDFA,
    applyDoorEvent,
    getDoorStateLabel,
    validateAutomaticDoor,
    type DoorEvent,
    type DoorState,
} from "../core/automaticDoor";

interface DoorHistoryItem {
    id: number;
    from: DoorState;
    event: DoorEvent;
    to: DoorState;
}

function labelEvent(event: DoorEvent): string {
    return event === "ADA_ORANG"
        ? "Ada orang"
        : "Tidak ada orang";
}

function deskripsiEvent(event: DoorEvent): string {
    return event === "ADA_ORANG"
        ? "Sensor mendeteksi seseorang di dekat pintu."
        : "Sensor tidak mendeteksi seseorang di dekat pintu.";
}

export default function AutomaticDoorStudy() {
    const [state, setState] = useState<DoorState>(
        automaticDoorDFA.start as DoorState,
    );

    const [history, setHistory] = useState<DoorHistoryItem[]>([]);
    const [pesan, setPesan] = useState(
        "Pintu siap digunakan. Pilih salah satu event sensor.",
    );

    const validationIssues = validateAutomaticDoor();
    const mesinValid = validationIssues.length === 0;

    // State tujuan ketika event ADA_ORANG diterima dari state awal.
    const openState =
        automaticDoorDFA.transitions[automaticDoorDFA.start]?.[
        "ADA_ORANG"
        ];

    const isOpen = state === openState;

    /**
     * Memproses event menggunakan fungsi inti automata,
     * bukan dengan mengubah state secara manual berdasarkan UI.
     */
    function jalankanEvent(event: DoorEvent): void {
        if (!mesinValid) {
            setPesan("Simulasi tidak dapat berjalan karena DFA pintu tidak valid.");
            return;
        }

        const stateSebelumnya = state;
        const stateBerikutnya = applyDoorEvent(stateSebelumnya, event);

        setState(stateBerikutnya);

        setHistory((riwayat) => [
            ...riwayat,
            {
                id: riwayat.length + 1,
                from: stateSebelumnya,
                event,
                to: stateBerikutnya,
            },
        ]);

        setPesan(
            event === "ADA_ORANG"
                ? "Sensor mendeteksi orang. Pintu bergerak ke posisi terbuka."
                : "Tidak ada orang yang terdeteksi. Pintu bergerak ke posisi tertutup.",
        );
    }

    /**
     * Mengembalikan state ke state awal dan menghapus riwayat.
     */
    function resetSimulasi(): void {
        setState(automaticDoorDFA.start as DoorState);
        setHistory([]);
        setPesan("Simulasi direset. Pintu kembali ke state awal.");
    }

    return (
        <div className="space-y-6">
            {/* Header studi kasus */}
            <section className="rounded-2xl border border-slate-200 p-5 dark:border-slate-700">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                            Level 5 · Studi Kasus
                        </p>

                        <h2 className="mt-1 text-2xl font-bold">
                            Simulasi Pintu Otomatis
                        </h2>

                        <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-400">
                            Pintu bekerja sebagai Deterministic Finite Automaton
                            (DFA). Setiap event sensor menentukan state berikutnya
                            secara pasti.
                        </p>
                    </div>

                    <span
                        className={[
                            "rounded-full px-3 py-1.5 text-sm font-semibold",
                            mesinValid
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                                : "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
                        ].join(" ")}
                    >
                        {mesinValid ? "DFA Valid" : "DFA Tidak Valid"}
                    </span>
                </div>
            </section>

            {/* Peringatan validasi */}
            {!mesinValid && (
                <section
                    role="alert"
                    className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/30"
                >
                    <h3 className="font-semibold text-red-800 dark:text-red-300">
                        Ada masalah pada mesin pintu
                    </h3>

                    <ul className="mt-2 list-inside list-disc text-sm text-red-700 dark:text-red-200">
                        {validationIssues.map((issue, index) => (
                            <li key={`${issue.type}-${index}`}>
                                {issue.message}
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            {/* Visualisasi pintu */}
            <section className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-4 dark:border-slate-700">
                    <div>
                        <h3 className="font-semibold">Visualisasi pintu</h3>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            Animasi mengikuti state automata saat ini.
                        </p>
                    </div>

                    <span
                        className={[
                            "rounded-xl px-4 py-2 text-sm font-bold",
                            isOpen
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                                : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
                        ].join(" ")}
                    >
                        {getDoorStateLabel(state)}
                    </span>
                </div>

                <div className="relative flex min-h-[310px] items-center justify-center overflow-hidden bg-slate-100 p-6 dark:bg-slate-950">
                    {/* Dekorasi dinding */}
                    <div
                        aria-hidden="true"
                        className="absolute inset-x-0 bottom-0 h-12 border-t border-slate-300 bg-slate-200 dark:border-slate-700 dark:bg-slate-900"
                    />

                    <div className="relative z-10">
                        {/* Rangka pintu */}
                        <div className="relative h-60 w-48 rounded-t-2xl border-[10px] border-slate-500 bg-slate-700 p-1 shadow-2xl dark:border-slate-500">
                            {/* Area di balik pintu */}
                            <div
                                className={[
                                    "absolute inset-1 transition-colors duration-700",
                                    isOpen
                                        ? "bg-gradient-to-b from-sky-200 to-amber-100 dark:from-sky-950 dark:to-amber-950"
                                        : "bg-slate-900 dark:bg-black",
                                ].join(" ")}
                            >
                                {isOpen && (
                                    <div className="absolute inset-x-3 bottom-0 top-5 flex flex-col items-center justify-center">
                                        <span className="text-4xl" aria-hidden="true">
                                            ☀️
                                        </span>

                                        <span className="mt-2 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-slate-700">
                                            Jalur terbuka
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Panel pintu yang berputar saat dibuka */}
                            <div
                                className={[
                                    "absolute inset-y-1 left-1 w-[calc(100%-8px)] border border-slate-400 shadow-lg",
                                    isOpen
                                        ? "bg-gradient-to-r from-indigo-500 to-indigo-700"
                                        : "bg-gradient-to-r from-slate-300 to-slate-500",
                                ].join(" ")}
                                style={{
                                    transformOrigin: "left center",
                                    transform: isOpen
                                        ? "perspective(800px) rotateY(-62deg)"
                                        : "perspective(800px) rotateY(0deg)",
                                    transition: "transform 700ms ease, background 500ms ease",
                                    backfaceVisibility: "hidden",
                                }}
                                aria-label={isOpen ? "Panel pintu terbuka" : "Panel pintu tertutup"}
                            >
                                <div className="absolute inset-3 rounded border border-white/30" />

                                <div className="absolute right-3 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-amber-300 shadow" />

                                {!isOpen && (
                                    <div className="absolute inset-x-0 top-5 text-center text-xs font-bold uppercase tracking-[0.2em] text-slate-800">
                                        Automatic
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Indikator sensor */}
                        <div className="absolute -right-12 top-8 flex flex-col items-center gap-2">
                            <div
                                className={[
                                    "h-4 w-4 rounded-full border-2 border-white shadow",
                                    isOpen
                                        ? "bg-emerald-500"
                                        : "bg-amber-500",
                                ].join(" ")}
                            />

                            <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                                SENSOR
                            </span>
                        </div>
                    </div>
                </div>

                <div className="border-t border-slate-200 p-4 dark:border-slate-700">
                    <p
                        role="status"
                        aria-live="polite"
                        className="text-sm text-slate-600 dark:text-slate-300"
                    >
                        {pesan}
                    </p>
                </div>
            </section>

            {/* Kontrol event sensor */}
            <section className="space-y-3">
                <h3 className="font-semibold">Kontrol sensor</h3>

                <div className="grid gap-3 sm:grid-cols-2">
                    {DOOR_EVENTS.map((event) => (
                        <button
                            key={event}
                            type="button"
                            onClick={() => jalankanEvent(event)}
                            disabled={!mesinValid}
                            className="rounded-2xl border border-slate-200 p-4 text-left transition hover:border-indigo-400 hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:hover:border-indigo-500 dark:hover:bg-indigo-950/30"
                        >
                            <span className="text-lg" aria-hidden="true">
                                {event === "ADA_ORANG" ? "🚶" : "🚪"}
                            </span>

                            <span className="mt-2 block font-semibold">
                                {labelEvent(event)}
                            </span>

                            <span className="mt-1 block text-sm text-slate-600 dark:text-slate-400">
                                {deskripsiEvent(event)}
                            </span>
                        </button>
                    ))}
                </div>

                <button
                    type="button"
                    onClick={resetSimulasi}
                    className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
                >
                    ↺ Reset simulasi
                </button>
            </section>

            {/* Representasi DFA sebagai tabel transisi */}
            <section>
                <h3 className="font-semibold">Tabel transisi DFA</h3>

                <div className="mt-3 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
                    <table className="w-full border-collapse text-left text-sm">
                        <thead className="bg-slate-100 dark:bg-slate-800">
                            <tr>
                                <th className="px-4 py-3">State saat ini</th>
                                <th className="px-4 py-3">Ada orang</th>
                                <th className="px-4 py-3">Tidak ada orang</th>
                            </tr>
                        </thead>

                        <tbody>
                            {automaticDoorDFA.states.map((doorState) => (
                                <tr
                                    key={doorState}
                                    className={[
                                        "border-t border-slate-200 dark:border-slate-700",
                                        state === doorState
                                            ? "bg-indigo-50 dark:bg-indigo-950/40"
                                            : "",
                                    ].join(" ")}
                                >
                                    <td className="px-4 py-3 font-mono">
                                        {doorState}
                                        {doorState === automaticDoorDFA.start && (
                                            <span className="ml-2 text-xs text-indigo-600 dark:text-indigo-400">
                                                (awal)
                                            </span>
                                        )}
                                    </td>

                                    <td className="px-4 py-3 font-mono">
                                        {automaticDoorDFA.transitions[doorState]?.[
                                            "ADA_ORANG"
                                        ] ?? "—"}
                                    </td>

                                    <td className="px-4 py-3 font-mono">
                                        {automaticDoorDFA.transitions[doorState]?.[
                                            "TIDAK_ADA_ORANG"
                                        ] ?? "—"}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Penjelasan state dan event */}
            <section className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                    <h3 className="font-semibold">Apa yang diingat DFA?</h3>

                    <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                        DFA mengingat state pintu saat ini, yaitu apakah
                        pintu sedang terbuka atau tertutup. Ketika event sensor
                        datang, mesin berpindah ke state tujuan berdasarkan
                        fungsi transisinya.
                    </p>
                </div>

                <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                    <h3 className="font-semibold">Lima komponen DFA</h3>

                    <div className="mt-3 space-y-2 text-sm">
                        <p>
                            <span className="font-semibold">Q:</span>{" "}
                            {automaticDoorDFA.states.join(", ")}
                        </p>

                        <p>
                            <span className="font-semibold">Σ:</span>{" "}
                            {automaticDoorDFA.alphabet.join(", ")}
                        </p>

                        <p>
                            <span className="font-semibold">q₀:</span>{" "}
                            {automaticDoorDFA.start}
                        </p>

                        <p>
                            <span className="font-semibold">F:</span>{" "}
                            {automaticDoorDFA.accepting.length > 0
                                ? automaticDoorDFA.accepting.join(", ")
                                : "Tidak ada"}
                        </p>

                        <p className="text-slate-500 dark:text-slate-400">
                            δ: fungsi transisi dari setiap pasangan state dan event.
                        </p>
                    </div>
                </div>
            </section>

            {/* Riwayat perubahan state */}
            <section>
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-semibold">Riwayat transisi</h3>

                    <span className="text-sm text-slate-500 dark:text-slate-400">
                        {history.length} event
                    </span>
                </div>

                <div className="mt-3 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
                    <table className="w-full min-w-[540px] border-collapse text-left text-sm">
                        <thead className="bg-slate-100 dark:bg-slate-800">
                            <tr>
                                <th className="px-4 py-3">Langkah</th>
                                <th className="px-4 py-3">State asal</th>
                                <th className="px-4 py-3">Event</th>
                                <th className="px-4 py-3">State tujuan</th>
                            </tr>
                        </thead>

                        <tbody>
                            {history.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={4}
                                        className="px-4 py-6 text-center text-slate-500 dark:text-slate-400"
                                    >
                                        Belum ada event. Coba tekan tombol sensor di atas.
                                    </td>
                                </tr>
                            ) : (
                                history.map((item) => (
                                    <tr
                                        key={item.id}
                                        className="border-t border-slate-200 dark:border-slate-700"
                                    >
                                        <td className="px-4 py-3">{item.id}</td>

                                        <td className="px-4 py-3 font-mono">
                                            {getDoorStateLabel(item.from)}
                                        </td>

                                        <td className="px-4 py-3">
                                            {labelEvent(item.event)}
                                        </td>

                                        <td className="px-4 py-3 font-mono font-semibold">
                                            {getDoorStateLabel(item.to)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}
