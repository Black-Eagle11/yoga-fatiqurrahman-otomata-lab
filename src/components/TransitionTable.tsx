
/**
 * Otomata Lab — Level 4
 * Editor tabel transisi DFA.
 *
 * Fitur:
 * - Menambah dan menghapus state.
 * - Menambah dan menghapus simbol alfabet.
 * - Mengubah tujuan transisi melalui dropdown.
 * - Menentukan state awal dan state akhir.
 * - Menandai transisi yang kosong atau tidak valid.
 * - Melengkapi transisi dengan dead state otomatis.
 *
 * Seluruh perubahan dikirim ke DFAWorkbench melalui onChange.
 */

import { useState } from "react";

import {
  validateDFA,
  type DFA,
  type State,
} from "../core/dfa";

import type { Symbol } from "../core/alphabet";

interface TransitionTableProps {
    dfa: DFA;
    onChange: (nextDFA: DFA) => void;
}

/**
 * Memastikan tujuan transisi merupakan state yang valid.
 */
function tujuanValid(
    tujuan: string | undefined,
    states: State[],
): boolean {
    return (
        typeof tujuan === "string" &&
        tujuan.trim() !== "" &&
        states.includes(tujuan)
    );
}

export default function TransitionTable({
    dfa,
    onChange,
}: TransitionTableProps) {
    const [namaStateBaru, setNamaStateBaru] = useState("");
    const [simbolBaru, setSimbolBaru] = useState("");
    const [pesan, setPesan] = useState("");

    const masalah = validateDFA(dfa);

    /**
     * Menambahkan state baru dengan seluruh transisi kosong.
     */
    function tambahState(): void {
        const nama = namaStateBaru.trim();

        if (!nama) {
            setPesan("Nama state tidak boleh kosong.");
            return;
        }

        if (dfa.states.includes(nama)) {
            setPesan(`State "${nama}" sudah ada.`);
            return;
        }

        const barisBaru: Record<Symbol, State> = {};

        for (const simbol of dfa.alphabet) {
            barisBaru[simbol] = "";
        }

        const transitions = {
            ...dfa.transitions,
            [nama]: barisBaru,
        };

        onChange({
            ...dfa,
            states: [...dfa.states, nama],
            transitions,
            start: dfa.states.includes(dfa.start)
                ? dfa.start
                : nama,
        });

        setNamaStateBaru("");
        setPesan(`State "${nama}" berhasil ditambahkan.`);
    }

    /**
     * Menghapus state beserta baris transisinya.
     *
     * Transisi lain yang menunjuk ke state tersebut dikosongkan
     * agar kekurangan transisi terlihat pada tabel.
     */
    function hapusState(stateDihapus: State): void {
        if (dfa.states.length <= 1) {
            setPesan("DFA harus memiliki minimal satu state.");
            return;
        }

        const states = dfa.states.filter(
            (state) => state !== stateDihapus,
        );

        const transitions: DFA["transitions"] = {};

        for (const state of states) {
            transitions[state] = {};

            for (const simbol of dfa.alphabet) {
                const tujuan = dfa.transitions[state]?.[simbol];

                transitions[state][simbol] =
                    tujuan !== stateDihapus && states.includes(tujuan)
                        ? tujuan
                        : "";
            }
        }

        const start =
            dfa.start === stateDihapus
                ? states[0] ?? ""
                : dfa.start;

        onChange({
            ...dfa,
            states,
            transitions,
            start,
            accepting: dfa.accepting.filter(
                (state) => state !== stateDihapus,
            ),
        });

        setPesan(
            `State "${stateDihapus}" dihapus. Periksa kembali transisi yang kosong.`,
        );
    }

    /**
     * Menambahkan satu simbol alfabet.
     *
     * Sesuai materi dasar, setiap simbol pada editor ini
     * terdiri dari satu karakter.
     */
    function tambahSimbol(): void {
        const simbol = simbolBaru.trim();

        if (!simbol) {
            setPesan("Simbol alfabet tidak boleh kosong.");
            return;
        }

        if (Array.from(simbol).length !== 1) {
            setPesan(
                "Setiap simbol alfabet pada editor ini harus satu karakter.",
            );
            return;
        }

        if (dfa.alphabet.includes(simbol)) {
            setPesan(`Simbol "${simbol}" sudah ada dalam alfabet.`);
            return;
        }

        const transitions: DFA["transitions"] = {};

        for (const state of dfa.states) {
            transitions[state] = {
                ...(dfa.transitions[state] ?? {}),
                [simbol]: "",
            };
        }

        onChange({
            ...dfa,
            alphabet: [...dfa.alphabet, simbol],
            transitions,
        });

        setSimbolBaru("");
        setPesan(
            `Simbol "${simbol}" ditambahkan. Isi seluruh transisi yang baru.`,
        );
    }

    /**
     * Menghapus simbol alfabet dan seluruh kolom transisinya.
     */
    function hapusSimbol(simbolDihapus: Symbol): void {
        const alphabet = dfa.alphabet.filter(
            (simbol) => simbol !== simbolDihapus,
        );

        const transitions: DFA["transitions"] = {};

        for (const state of dfa.states) {
            transitions[state] = {};

            for (const simbol of alphabet) {
                transitions[state][simbol] =
                    dfa.transitions[state]?.[simbol] ?? "";
            }
        }

        onChange({
            ...dfa,
            alphabet,
            transitions,
        });

        setPesan(`Simbol "${simbolDihapus}" berhasil dihapus.`);
    }

    /**
     * Mengubah tujuan satu transisi tanpa mengubah transisi lain.
     */
    function ubahTransisi(
        state: State,
        simbol: Symbol,
        tujuan: State,
    ): void {
        const transitions = {
            ...dfa.transitions,
            [state]: {
                ...(dfa.transitions[state] ?? {}),
                [simbol]: tujuan,
            },
        };

        onChange({
            ...dfa,
            transitions,
        });

        setPesan("");
    }

    /**
     * Membuat dead state baru yang unik dan mengarahkan seluruh
     * transisi yang kosong atau tidak valid ke state tersebut.
     *
     * Dead state tidak ditandai sebagai state akhir.
     */
    function lengkapiDeadState(): void {
        if (dfa.alphabet.length === 0) {
            setPesan(
                "Tambahkan minimal satu simbol sebelum melengkapi transisi.",
            );
            return;
        }

        let namaDead = "qDead";
        let nomor = 2;

        while (dfa.states.includes(namaDead)) {
            namaDead = `qDead${nomor}`;
            nomor++;
        }

        const mempunyaiTransisiKosong = dfa.states.some((state) =>
            dfa.alphabet.some(
                (simbol) =>
                    !tujuanValid(
                        dfa.transitions[state]?.[simbol],
                        dfa.states,
                    ),
            ),
        );

        if (!mempunyaiTransisiKosong) {
            setPesan("Semua transisi sudah terisi dan valid.");
            return;
        }

        const states = [...dfa.states, namaDead];
        const transitions: DFA["transitions"] = {};

        for (const state of dfa.states) {
            transitions[state] = {};

            for (const simbol of dfa.alphabet) {
                const tujuan = dfa.transitions[state]?.[simbol];

                transitions[state][simbol] = tujuanValid(
                    tujuan,
                    dfa.states,
                )
                    ? tujuan!
                    : namaDead;
            }
        }

        transitions[namaDead] = {};

        for (const simbol of dfa.alphabet) {
            transitions[namaDead][simbol] = namaDead;
        }

        onChange({
            ...dfa,
            states,
            transitions,
        });

        setPesan(
            `Dead state "${namaDead}" dibuat dan transisi yang kosong telah dilengkapi.`,
        );
    }

    return (
        <div className="space-y-5">
            {/* Form untuk menambah state dan simbol */}
            <div className="grid gap-4 lg:grid-cols-2">
                <section className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                    <h3 className="font-semibold">Tambah state</h3>

                    <form
                        className="mt-3 flex flex-col gap-2 sm:flex-row"
                        onSubmit={(event) => {
                            event.preventDefault();
                            tambahState();
                        }}
                    >
                        <input
                            type="text"
                            value={namaStateBaru}
                            onChange={(event) =>
                                setNamaStateBaru(event.target.value)
                            }
                            placeholder="Contoh: q3"
                            aria-label="Nama state baru"
                            className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-950"
                        />

                        <button
                            type="submit"
                            className="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700"
                        >
                            Tambah state
                        </button>
                    </form>
                </section>

                <section className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                    <h3 className="font-semibold">Tambah simbol</h3>

                    <form
                        className="mt-3 flex flex-col gap-2 sm:flex-row"
                        onSubmit={(event) => {
                            event.preventDefault();
                            tambahSimbol();
                        }}
                    >
                        <input
                            type="text"
                            value={simbolBaru}
                            onChange={(event) =>
                                setSimbolBaru(event.target.value)
                            }
                            placeholder="Contoh: c"
                            aria-label="Simbol alfabet baru"
                            maxLength={2}
                            className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-950"
                        />

                        <button
                            type="submit"
                            className="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700"
                        >
                            Tambah simbol
                        </button>
                    </form>
                </section>
            </div>

            {/* Pesan interaksi */}
            {pesan && (
                <p
                    role="status"
                    aria-live="polite"
                    className="rounded-lg border border-indigo-200 bg-indigo-50 p-3 text-sm text-indigo-800 dark:border-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-200"
                >
                    {pesan}
                </p>
            )}

            {/* Ringkasan masalah validasi */}
            {masalah.length > 0 && (
                <section
                    role="alert"
                    className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/30"
                >
                    <h3 className="font-semibold text-red-800 dark:text-red-300">
                        DFA belum valid ({masalah.length} masalah)
                    </h3>

                    <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-red-700 dark:text-red-200">
                        {masalah.map((item, indeks) => (
                            <li key={`${item.type}-${indeks}`}>
                                {item.message}
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            {/* Pengaturan state awal dan tabel transisi */}
            <section>
                <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h3 className="font-semibold">Tabel transisi δ</h3>

                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                            Pilih satu state tujuan untuk setiap pasangan state
                            dan simbol. Sel merah perlu diperbaiki.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={lengkapiDeadState}
                        className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200"
                    >
                        Lengkapi dengan dead state
                    </button>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
                    <table className="w-full min-w-max border-collapse text-left text-sm">
                        <thead className="bg-slate-100 dark:bg-slate-800">
                            <tr>
                                <th className="border-b border-slate-200 px-3 py-3 dark:border-slate-700">
                                    State
                                </th>

                                <th className="border-b border-slate-200 px-3 py-3 dark:border-slate-700">
                                    q0 / F
                                </th>

                                {dfa.alphabet.map((simbol) => (
                                    <th
                                        key={simbol}
                                        className="border-b border-slate-200 px-3 py-3 dark:border-slate-700"
                                    >
                                        <div className="flex items-center justify-between gap-3">
                                            <span className="font-mono">{simbol}</span>

                                            <button
                                                type="button"
                                                onClick={() => hapusSimbol(simbol)}
                                                aria-label={`Hapus simbol ${simbol}`}
                                                title={`Hapus simbol ${simbol}`}
                                                className="rounded px-2 py-1 text-xs text-red-600 hover:bg-red-100 dark:text-red-300 dark:hover:bg-red-950"
                                            >
                                                Hapus
                                            </button>
                                        </div>
                                    </th>
                                ))}

                                <th className="border-b border-slate-200 px-3 py-3 dark:border-slate-700">
                                    Aksi
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {dfa.states.map((state) => (
                                <tr
                                    key={state}
                                    className="border-b border-slate-100 last:border-b-0 dark:border-slate-800"
                                >
                                    <th className="px-3 py-3 font-mono font-semibold">
                                        {state}
                                    </th>

                                    <td className="px-3 py-3">
                                        <div className="flex flex-col gap-3">
                                            <label className="flex items-center gap-2 whitespace-nowrap">
                                                <input
                                                    type="radio"
                                                    name="dfa-start-state"
                                                    checked={dfa.start === state}
                                                    onChange={() =>
                                                        onChange({ ...dfa, start: state })
                                                    }
                                                    aria-label={`Jadikan ${state} sebagai state awal`}
                                                    className="accent-indigo-600"
                                                />

                                                <span>→ Awal</span>
                                            </label>

                                            <label className="flex items-center gap-2 whitespace-nowrap">
                                                <input
                                                    type="checkbox"
                                                    checked={dfa.accepting.includes(state)}
                                                    onChange={(event) => {
                                                        const accepting = event.target.checked
                                                            ? [...dfa.accepting, state]
                                                            : dfa.accepting.filter(
                                                                (item) => item !== state,
                                                            );

                                                        onChange({
                                                            ...dfa,
                                                            accepting,
                                                        });
                                                    }}
                                                    aria-label={`Tandai ${state} sebagai state akhir`}
                                                    className="accent-emerald-600"
                                                />

                                                <span>* Akhir</span>
                                            </label>
                                        </div>
                                    </td>

                                    {dfa.alphabet.map((simbol) => {
                                        const tujuan =
                                            dfa.transitions[state]?.[simbol];

                                        const valid = tujuanValid(
                                            tujuan,
                                            dfa.states,
                                        );

                                        return (
                                            <td
                                                key={`${state}-${simbol}`}
                                                className="px-3 py-3"
                                            >
                                                <select
                                                    value={valid ? tujuan : ""}
                                                    onChange={(event) =>
                                                        ubahTransisi(
                                                            state,
                                                            simbol,
                                                            event.target.value,
                                                        )
                                                    }
                                                    aria-label={`Transisi ${state} dengan simbol ${simbol}`}
                                                    aria-invalid={!valid}
                                                    className={[
                                                        "min-w-32 rounded-lg border px-3 py-2 font-mono outline-none focus:ring-2",
                                                        valid
                                                            ? "border-slate-300 bg-white focus:border-indigo-500 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:focus:ring-indigo-950"
                                                            : "border-red-400 bg-red-50 text-red-800 focus:ring-red-100 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200",
                                                    ].join(" ")}
                                                >
                                                    <option value="">— Pilih state —</option>

                                                    {dfa.states.map((tujuanState) => (
                                                        <option
                                                            key={tujuanState}
                                                            value={tujuanState}
                                                        >
                                                            {tujuanState}
                                                        </option>
                                                    ))}
                                                </select>

                                                {!valid && (
                                                    <p className="mt-1 text-xs text-red-600 dark:text-red-300">
                                                        Transisi belum valid
                                                    </p>
                                                )}
                                            </td>
                                        );
                                    })}

                                    <td className="px-3 py-3">
                                        <button
                                            type="button"
                                            disabled={dfa.states.length <= 1}
                                            onClick={() => hapusState(state)}
                                            className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950/40"
                                        >
                                            Hapus
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-600 dark:text-slate-400">
                    <span className="rounded-md bg-slate-100 px-2 py-1 dark:bg-slate-800">
                        → = State awal
                    </span>

                    <span className="rounded-md bg-slate-100 px-2 py-1 dark:bg-slate-800">
                        * = State akhir
                    </span>

                    <span className="rounded-md bg-red-50 px-2 py-1 text-red-700 dark:bg-red-950/40 dark:text-red-300">
                        Merah = Transisi belum valid
                    </span>
                </div>
            </section>
        </div>
    );
}
