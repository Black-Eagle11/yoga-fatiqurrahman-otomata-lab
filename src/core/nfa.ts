
/**
 * Otomata Lab — Bonus B7
 * Logika inti Non-deterministic Finite Automaton (NFA).
 *
 * Perbedaan utama:
 * DFA menghasilkan tepat satu state tujuan untuk setiap
 * pasangan state dan simbol pada transisi yang lengkap.
 *
 * NFA dapat menghasilkan beberapa state tujuan sekaligus.
 * Transisi yang tidak tersedia dianggap menghasilkan himpunan kosong.
 *
 * Seluruh logika dalam file ini tidak bergantung pada React.
 */

import type { Symbol } from "./alphabet";
import type { State } from "./dfa";

/**
 * Representasi NFA berdasarkan lima komponen automata.
 *
 * Transisi dapat memiliki beberapa state tujuan.
 * Baris atau simbol yang tidak tersedia dianggap tidak memiliki
 * transisi untuk kombinasi tersebut.
 */
export interface NFA {
    name: string;
    states: State[];
    alphabet: Symbol[];
    transitions: Partial<
        Record<State, Partial<Record<Symbol, State[]>>>
    >;
    start: State;
    accepting: State[];
}

/**
 * Jenis masalah yang dapat ditemukan ketika memvalidasi NFA.
 */
export type NFAValidationIssueType =
    | "NO_STATES"
    | "DUPLICATE_STATE"
    | "DUPLICATE_SYMBOL"
    | "INVALID_ALPHABET"
    | "NO_START"
    | "START_NOT_IN_Q"
    | "ACCEPTING_NOT_IN_Q"
    | "UNKNOWN_STATE"
    | "UNKNOWN_SYMBOL"
    | "INVALID_TRANSITION";

/**
 * Pesan masalah dalam struktur NFA.
 */
export interface NFAValidationIssue {
    type: NFAValidationIssueType;
    message: string;
}

/**
 * Catatan satu langkah simulasi NFA.
 *
 * Karena NFA dapat mempunyai beberapa jalur,
 * state asal dan state tujuan disimpan sebagai array.
 */
export interface NFATraceStep {
    step: number;
    symbol: Symbol;
    from: State[];
    to: State[];
}

/**
 * Hasil simulasi NFA.
 */
export interface NFAResult {
    accepted: boolean;
    finalStates: State[];
    steps: NFATraceStep[];
    error?: string;
    input?: string;
}

/**
 * Memvalidasi struktur NFA.
 *
 * Transisi yang tidak tersedia tidak dianggap sebagai kesalahan,
 * karena NFA dapat memiliki himpunan state tujuan yang kosong.
 */
export function validateNFA(nfa: NFA): NFAValidationIssue[] {
    const issues: NFAValidationIssue[] = [];

    if (!nfa || !Array.isArray(nfa.states)) {
        return [
            {
                type: "NO_STATES",
                message: "Daftar state NFA tidak valid.",
            },
        ];
    }

    if (nfa.states.length === 0) {
        issues.push({
            type: "NO_STATES",
            message: "NFA harus mempunyai minimal satu state.",
        });
    }

    if (new Set(nfa.states).size !== nfa.states.length) {
        issues.push({
            type: "DUPLICATE_STATE",
            message: "NFA tidak boleh mempunyai state duplikat.",
        });
    }

    if (!Array.isArray(nfa.alphabet)) {
        issues.push({
            type: "INVALID_ALPHABET",
            message: "Alfabet NFA harus berupa array.",
        });

        return issues;
    }

    if (
        nfa.alphabet.some(
            (symbol) =>
                typeof symbol !== "string" || symbol.length === 0,
        )
    ) {
        issues.push({
            type: "INVALID_ALPHABET",
            message: "Simbol alfabet tidak boleh kosong.",
        });
    }

    if (new Set(nfa.alphabet).size !== nfa.alphabet.length) {
        issues.push({
            type: "DUPLICATE_SYMBOL",
            message: "Alfabet NFA tidak boleh mempunyai simbol duplikat.",
        });
    }

    const stateSet = new Set(nfa.states);
    const alphabetSet = new Set(nfa.alphabet);

    // Memeriksa state awal.
    if (
        typeof nfa.start !== "string" ||
        nfa.start.trim() === ""
    ) {
        issues.push({
            type: "NO_START",
            message: "State awal NFA belum ditentukan.",
        });
    } else if (!stateSet.has(nfa.start)) {
        issues.push({
            type: "START_NOT_IN_Q",
            message: `State awal "${nfa.start}" tidak terdaftar dalam Q.`,
        });
    }

    // Memeriksa seluruh state akhir.
    for (const state of nfa.accepting) {
        if (!stateSet.has(state)) {
            issues.push({
                type: "ACCEPTING_NOT_IN_Q",
                message: `State akhir "${state}" tidak terdaftar dalam Q.`,
            });
        }
    }

    // Memeriksa seluruh state sumber dan transisi.
    for (const [source, row] of Object.entries(nfa.transitions)) {
        if (!stateSet.has(source)) {
            issues.push({
                type: "UNKNOWN_STATE",
                message: `State sumber "${source}" tidak terdaftar dalam Q.`,
            });
        }

        if (
            typeof row !== "object" ||
            row === null ||
            Array.isArray(row)
        ) {
            issues.push({
                type: "INVALID_TRANSITION",
                message: `Tabel transisi untuk state "${source}" tidak valid.`,
            });

            continue;
        }

        for (const [symbol, destinations] of Object.entries(row)) {
            if (!alphabetSet.has(symbol)) {
                issues.push({
                    type: "UNKNOWN_SYMBOL",
                    message: `Simbol "${symbol}" tidak terdaftar dalam alfabet NFA.`,
                });
            }

            if (
                !Array.isArray(destinations) ||
                !destinations.every(
                    (destination) =>
                        typeof destination === "string" &&
                        destination.trim() !== "",
                )
            ) {
                issues.push({
                    type: "INVALID_TRANSITION",
                    message: `Daftar state tujuan untuk "${source}" dengan simbol "${symbol}" tidak valid.`,
                });

                continue;
            }

            for (const destination of destinations) {
                if (!stateSet.has(destination)) {
                    issues.push({
                        type: "UNKNOWN_STATE",
                        message: `State tujuan "${destination}" tidak terdaftar dalam Q.`,
                    });
                }
            }
        }
    }

    return issues;
}

/**
 * Memeriksa apakah NFA mempunyai transisi dengan lebih dari
 * satu state tujuan.
 *
 * Jika hasilnya true, setidaknya ada satu transisi yang menunjukkan
 * sifat nondeterministik pada model tersebut.
 */
export function hasNondeterministicTransition(nfa: NFA): boolean {
    return Object.values(nfa.transitions).some(
        (row) =>
            row !== undefined &&
            Object.values(row).some(
                (destinations) =>
                    Array.isArray(destinations) &&
                    destinations.length > 1,
            ),
    );
}

/**
 * Mengubah urutan simbol menjadi teks untuk ditampilkan.
 *
 * Simbol satu karakter digabung tanpa pemisah.
 * Simbol yang terdiri dari beberapa karakter dipisahkan spasi.
 */
function formatInputSymbols(symbols: Symbol[]): string {
    if (symbols.length === 0) {
        return "";
    }

    const hasLongSymbol = symbols.some(
        (symbol) => Array.from(symbol).length !== 1,
    );

    return hasLongSymbol ? symbols.join(" ") : symbols.join("");
}

/**
 * Menjalankan NFA berdasarkan daftar simbol utuh.
 *
 * Pada setiap langkah, semua kemungkinan state tujuan
 * dikumpulkan menjadi satu himpunan state aktif.
 *
 * Input diterima jika setidaknya satu jalur berakhir
 * pada state akhir setelah seluruh simbol habis dibaca.
 */
export function runNFASymbols(
    nfa: NFA,
    symbols: Symbol[],
): NFAResult {
    const input = formatInputSymbols(symbols);
    const steps: NFATraceStep[] = [];

    const issues = validateNFA(nfa);

    if (issues.length > 0) {
        return {
            accepted: false,
            finalStates: [],
            steps,
            error: `NFA tidak valid:\n${issues
                .map((issue) => issue.message)
                .join("\n")}`,
            input,
        };
    }

    let currentStates: State[] = [nfa.start];

    for (let index = 0; index < symbols.length; index++) {
        const symbol = symbols[index];

        if (!nfa.alphabet.includes(symbol)) {
            return {
                accepted: false,
                finalStates: currentStates,
                steps,
                error: `Simbol "${symbol}" tidak ada di alfabet NFA.`,
                input,
            };
        }

        const nextStates = new Set<State>();

        // Mengumpulkan tujuan dari setiap state yang sedang aktif.
        for (const state of currentStates) {
            const destinations =
                nfa.transitions[state]?.[symbol] ?? [];

            for (const destination of destinations) {
                nextStates.add(destination);
            }
        }

        const resultStates = [...nextStates];

        steps.push({
            step: index + 1,
            symbol,
            from: [...currentStates],
            to: resultStates,
        });

        currentStates = resultStates;
    }

    return {
        accepted: currentStates.some((state) =>
            nfa.accepting.includes(state),
        ),
        finalStates: currentStates,
        steps,
        input,
    };
}

/**
 * Menjalankan NFA pada string yang setiap simbolnya
 * direpresentasikan oleh satu karakter Unicode.
 *
 * Untuk simbol kejadian yang terdiri dari banyak karakter,
 * gunakan runNFASymbols().
 */
export function runNFA(nfa: NFA, input: string): NFAResult {
    if (typeof input !== "string") {
        return {
            accepted: false,
            finalStates: [],
            steps: [],
            error: "Input harus berupa string.",
            input: "",
        };
    }

    const result = runNFASymbols(nfa, Array.from(input));

    return {
        ...result,
        input,
    };
}
