/**
 * Otomata Lab — Level 3
 * Mesin inti Deterministic Finite Automaton (DFA).
 *
 * Model DFA:
 * M = (Q, Σ, δ, q0, F)
 *
 * Seluruh logika di file ini tidak bergantung pada React
 * maupun antarmuka browser sehingga dapat diuji secara terpisah.
 */

import type { Symbol } from "./alphabet";

export type State = string;

/**
 * Representasi DFA berdasarkan model 5-tuple.
 */
export interface DFA {
    name: string;
    states: State[];
    alphabet: Symbol[];
    transitions: Record<State, Record<Symbol, State>>;
    start: State;
    accepting: State[];
}

/**
 * Catatan satu langkah simulasi DFA.
 */
export interface TraceStep {
    step: number;
    from: State;
    symbol: Symbol;
    to: State;
}

/**
 * Hasil menjalankan suatu input pada DFA.
 */
export interface RunResult {
    accepted: boolean;
    finalState: State;
    steps: TraceStep[];
    error?: string;
    input?: string;
}

/**
 * Jenis masalah yang dapat ditemukan saat validasi DFA.
 */
export type ValidationIssueType =
    | "MISSING_TRANSITION"
    | "UNKNOWN_STATE"
    | "NO_START"
    | "START_NOT_IN_Q"
    | "ACCEPTING_NOT_IN_Q";

/**
 * Pesan masalah yang ditemukan oleh validator DFA.
 */
export interface ValidationIssue {
    type: ValidationIssueType;
    message: string;
}

/**
 * Mengubah daftar simbol menjadi teks untuk ditampilkan.
 *
 * Simbol satu karakter digabung tanpa pemisah.
 * Simbol yang terdiri dari beberapa karakter dipisahkan spasi.
 */
function formatInputSymbols(symbols: Symbol[]): string {
    const hasMultiCharacterSymbol = symbols.some(
        (symbol) => Array.from(symbol).length !== 1,
    );

    return hasMultiCharacterSymbol
        ? symbols.join(" ")
        : symbols.join("");
}

/**
 * Memvalidasi struktur DFA.
 *
 * Validator memeriksa:
 * - State awal harus ditentukan dan terdaftar dalam Q.
 * - Semua state akhir harus terdaftar dalam Q.
 * - State sumber transisi harus terdaftar dalam Q.
 * - Setiap pasangan state dan simbol harus mempunyai transisi.
 * - Setiap state tujuan harus terdaftar dalam Q.
 *
 * Array kosong berarti tidak ditemukan masalah validasi.
 */
export function validateDFA(dfa: DFA): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    const stateSet = new Set(dfa.states);

    // Memeriksa state awal.
    if (
        typeof dfa.start !== "string" ||
        dfa.start.trim() === ""
    ) {
        issues.push({
            type: "NO_START",
            message: "State awal DFA belum ditentukan.",
        });
    } else if (!stateSet.has(dfa.start)) {
        issues.push({
            type: "START_NOT_IN_Q",
            message: `State awal "${dfa.start}" tidak terdaftar dalam Q.`,
        });
    }

    // Memeriksa semua state akhir.
    for (const state of dfa.accepting) {
        if (!stateSet.has(state)) {
            issues.push({
                type: "ACCEPTING_NOT_IN_Q",
                message: `State akhir "${state}" tidak terdaftar dalam Q.`,
            });
        }
    }

    // Memeriksa state sumber pada tabel transisi.
    for (const source of Object.keys(dfa.transitions)) {
        if (!stateSet.has(source)) {
            issues.push({
                type: "UNKNOWN_STATE",
                message: `State sumber transisi "${source}" tidak terdaftar dalam Q.`,
            });
        }
    }

    // Memeriksa kelengkapan transisi setiap state dan simbol.
    for (const state of dfa.states) {
        for (const symbol of dfa.alphabet) {
            const row = dfa.transitions[state];
            const destination = row?.[symbol];

            if (
                typeof destination !== "string" ||
                destination.trim() === ""
            ) {
                issues.push({
                    type: "MISSING_TRANSITION",
                    message: `State "${state}" tidak memiliki transisi untuk simbol "${symbol}".`,
                });

                continue;
            }

            if (!stateSet.has(destination)) {
                issues.push({
                    type: "UNKNOWN_STATE",
                    message: `State tujuan "${destination}" dari state "${state}" dengan simbol "${symbol}" tidak terdaftar dalam Q.`,
                });
            }
        }
    }

    return issues;
}

/**
 * Menjalankan satu fungsi transisi:
 * δ(q, a) = state tujuan.
 *
 * Fungsi menghasilkan error jika state asal tidak dikenal,
 * simbol tidak terdaftar, transisi belum diisi,
 * atau state tujuan tidak dikenal.
 */
export function delta(
    dfa: DFA,
    q: State,
    a: Symbol,
): State {
    if (!dfa.states.includes(q)) {
        throw new Error(`State "${q}" tidak terdaftar dalam Q.`);
    }

    if (!dfa.alphabet.includes(a)) {
        throw new Error(`Simbol "${a}" tidak ada di alfabet Σ.`);
    }

    const row = dfa.transitions[q];

    if (
        !row ||
        !Object.prototype.hasOwnProperty.call(row, a)
    ) {
        throw new Error(
            `Transisi dari state "${q}" untuk simbol "${a}" belum diisi.`,
        );
    }

    const destination = row[a];

    if (
        typeof destination !== "string" ||
        destination.trim() === ""
    ) {
        throw new Error(
            `Transisi dari state "${q}" untuk simbol "${a}" belum memiliki state tujuan.`,
        );
    }

    if (!dfa.states.includes(destination)) {
        throw new Error(
            `State tujuan "${destination}" tidak terdaftar dalam Q.`,
        );
    }

    return destination;
}

/**
 * Menjalankan DFA berdasarkan daftar simbol utuh.
 *
 * Fungsi ini mendukung alfabet biasa maupun simbol kejadian
 * yang terdiri dari beberapa karakter, seperti ADA_ORANG.
 *
 * Keputusan diterima atau ditolak hanya dilakukan setelah
 * seluruh simbol berhasil dibaca.
 */
export function runSymbols(
    dfa: DFA,
    symbols: Symbol[],
): RunResult {
    const input = formatInputSymbols(symbols);
    const steps: TraceStep[] = [];

    // Memeriksa state awal sebelum simulasi dimulai.
    if (
        typeof dfa.start !== "string" ||
        !dfa.states.includes(dfa.start)
    ) {
        const error =
            typeof dfa.start !== "string" ||
                dfa.start.trim() === ""
                ? "State awal DFA belum ditentukan."
                : `State awal "${dfa.start}" tidak terdaftar dalam Q.`;

        return {
            accepted: false,
            finalState: dfa.start ?? "",
            steps,
            error,
            input,
        };
    }

    let currentState = dfa.start;

    // Membaca seluruh simbol dari kiri ke kanan.
    for (let index = 0; index < symbols.length; index++) {
        const symbol = symbols[index];

        try {
            const nextState = delta(dfa, currentState, symbol);

            steps.push({
                step: index + 1,
                from: currentState,
                symbol,
                to: nextState,
            });

            currentState = nextState;
        } catch (error: unknown) {
            return {
                accepted: false,
                finalState: currentState,
                steps,
                error:
                    error instanceof Error
                        ? error.message
                        : "Terjadi kesalahan ketika menjalankan DFA.",
                input,
            };
        }
    }

    // Keputusan akhir hanya berdasarkan state setelah input habis.
    return {
        accepted: dfa.accepting.includes(currentState),
        finalState: currentState,
        steps,
        input,
    };
}

/**
 * Menjalankan DFA pada string yang setiap simbolnya
 * direpresentasikan oleh satu karakter Unicode.
 *
 * Untuk simbol kejadian yang terdiri dari beberapa karakter,
 * gunakan runSymbols().
 */
export function run(dfa: DFA, w: string): RunResult {
    if (typeof w !== "string") {
        return {
            accepted: false,
            finalState: dfa.start ?? "",
            steps: [],
            error: "Input harus berupa string.",
            input: "",
        };
    }

    const result = runSymbols(dfa, Array.from(w));

    return {
        ...result,
        input: w,
    };
}

/**
 * Membentuk teks jejak simulasi agar mudah dibaca.
 *
 * Contoh:
 * 101 : q0 --1--> q1 --0--> q0 --1--> q1 ⇒ DITERIMA
 */
export function formatTrace(result: RunResult): string {
    const input =
        result.input ??
        formatInputSymbols(result.steps.map((step) => step.symbol));

    const inputLabel = input === "" ? "ε" : input;

    const path =
        result.steps.length === 0
            ? result.finalState
            : `${result.steps[0].from}${result.steps
                .map(
                    (step) => ` --${step.symbol}--> ${step.to}`,
                )
                .join("")}`;

    const outcome = result.error
        ? `ERROR: ${result.error}`
        : result.accepted
            ? "DITERIMA"
            : "DITOLAK";

    return `${inputLabel} : ${path} ⇒ ${outcome}`;
}

/**
 * Mencari state bukan-akhir yang seluruh transisinya
 * kembali ke state itu sendiri.
 *
 * State dengan transisi yang belum lengkap tidak dianggap
 * sebagai dead state.
 */
export function findDeadStates(dfa: DFA): State[] {
    if (dfa.alphabet.length === 0) {
        return [];
    }

    return dfa.states.filter((state) => {
        if (dfa.accepting.includes(state)) {
            return false;
        }

        return dfa.alphabet.every((symbol) => {
            const row = dfa.transitions[state];

            if (
                !row ||
                !Object.prototype.hasOwnProperty.call(row, symbol)
            ) {
                return false;
            }

            return row[symbol] === state;
        });
    });
}
