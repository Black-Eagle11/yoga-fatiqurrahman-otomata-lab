
/**
 * Otomata Lab — Penyimpanan DFA
 * Mendukung bonus B2: impor, ekspor, dan penyimpanan DFA.
 *
 * Data yang dibaca dari JSON atau penyimpanan lokal harus
 * diperiksa sebelum digunakan oleh aplikasi.
 */

import {
    validateDFA,
    type DFA,
} from "./dfa";

/**
 * Kunci bawaan yang digunakan untuk menyimpan DFA.
 */
export const DFA_STORAGE_KEY = "otomata-lab:dfa";

/**
 * Bentuk penyimpanan sederhana agar logika mudah diuji.
 */
export interface StorageLike {
    getItem(key: string): string | null;
    setItem(key: string, value: string): void;
    removeItem(key: string): void;
}

/**
 * Memastikan suatu nilai merupakan objek biasa,
 * bukan null maupun array.
 */
function isRecord(
    value: unknown,
): value is Record<string, unknown> {
    return (
        typeof value === "object" &&
        value !== null &&
        !Array.isArray(value)
    );
}

/**
 * Memeriksa dan memvalidasi data DFA sebelum digunakan.
 *
 * Selain bentuk objek, fungsi ini memeriksa state duplikat,
 * simbol alfabet duplikat, transisi yang tidak dikenal,
 * serta seluruh aturan validasi DFA.
 */
function pastikanDFAValid(
    value: unknown,
): asserts value is DFA {
    if (!isRecord(value)) {
        throw new Error("Data DFA harus berupa objek JSON.");
    }

    if (
        typeof value.name !== "string" ||
        value.name.trim() === ""
    ) {
        throw new Error("Nama DFA harus berupa string yang tidak kosong.");
    }

    if (
        !Array.isArray(value.states) ||
        value.states.length === 0 ||
        !value.states.every(
            (state) =>
                typeof state === "string" && state.trim() !== "",
        )
    ) {
        throw new Error(
            "DFA harus memiliki daftar state yang tidak kosong dan valid.",
        );
    }

    if (!Array.isArray(value.alphabet)) {
        throw new Error("Alfabet DFA harus berupa array.");
    }

    if (
        !value.alphabet.every(
            (symbol) =>
                typeof symbol === "string" && symbol.trim() !== "",
        )
    ) {
        throw new Error(
            "Setiap simbol alfabet harus berupa string yang tidak kosong.",
        );
    }

    if (
        new Set(value.states).size !== value.states.length
    ) {
        throw new Error("DFA tidak boleh memiliki state duplikat.");
    }

    if (
        new Set(value.alphabet).size !== value.alphabet.length
    ) {
        throw new Error("Alfabet DFA tidak boleh memiliki simbol duplikat.");
    }

    if (
        typeof value.start !== "string" ||
        value.start.trim() === ""
    ) {
        throw new Error("State awal DFA harus ditentukan.");
    }

    if (
        !Array.isArray(value.accepting) ||
        !value.accepting.every(
            (state) =>
                typeof state === "string" && state.trim() !== "",
        )
    ) {
        throw new Error("Daftar state akhir DFA tidak valid.");
    }

    if (
        new Set(value.accepting).size !== value.accepting.length
    ) {
        throw new Error("Daftar state akhir tidak boleh duplikat.");
    }

    if (!isRecord(value.transitions)) {
        throw new Error("Tabel transisi DFA harus berupa objek.");
    }

    const alphabet = new Set(value.alphabet);

    for (const [source, row] of Object.entries(value.transitions)) {
        if (!isRecord(row)) {
            throw new Error(
                `Tabel transisi untuk state "${source}" tidak valid.`,
            );
        }

        for (const [symbol, destination] of Object.entries(row)) {
            if (!alphabet.has(symbol)) {
                throw new Error(
                    `Simbol transisi "${symbol}" tidak terdaftar dalam alfabet.`,
                );
            }

            if (
                typeof destination !== "string" ||
                destination.trim() === ""
            ) {
                throw new Error(
                    `Tujuan transisi "${source}" untuk simbol "${symbol}" tidak valid.`,
                );
            }
        }
    }

    const dfa = value as unknown as DFA;
    const issues = validateDFA(dfa);

    if (issues.length > 0) {
        throw new Error(
            `DFA tidak valid:\n${issues
                .map((issue) => issue.message)
                .join("\n")}`,
        );
    }
}

/**
 * Mengubah DFA valid menjadi teks JSON yang mudah dibaca.
 *
 * Hasil fungsi ini dapat diunduh sebagai berkas .json
 * oleh komponen antarmuka.
 */
export function serializeDFA(dfa: DFA): string {
    pastikanDFAValid(dfa);

    return JSON.stringify(dfa, null, 2);
}

/**
 * Membaca teks JSON dan mengubahnya menjadi DFA yang valid.
 *
 * Fungsi melempar Error jika JSON rusak, struktur datanya salah,
 * atau aturan validasi DFA tidak terpenuhi.
 */
export function deserializeDFA(json: string): DFA {
    let parsed: unknown;

    try {
        parsed = JSON.parse(json);
    } catch {
        throw new Error(
            "Berkas JSON tidak dapat dibaca. Periksa format berkas.",
        );
    }

    pastikanDFAValid(parsed);

    return parsed;
}

/**
 * Menyimpan DFA valid ke penyimpanan lokal.
 *
 * Parameter storage diberikan dari luar agar fungsi ini
 * bisa diuji menggunakan penyimpanan tiruan.
 */
export function saveDFAToStorage(
    dfa: DFA,
    storage: StorageLike,
    key: string = DFA_STORAGE_KEY,
): void {
    const json = serializeDFA(dfa);

    storage.setItem(key, json);
}

/**
 * Membaca DFA dari penyimpanan lokal.
 *
 * Menghasilkan null apabila belum ada DFA tersimpan.
 * Data yang rusak atau tidak valid akan menghasilkan Error.
 */
export function loadDFAFromStorage(
    storage: StorageLike,
    key: string = DFA_STORAGE_KEY,
): DFA | null {
    const json = storage.getItem(key);

    if (json === null) {
        return null;
    }

    return deserializeDFA(json);
}

/**
 * Menghapus DFA yang tersimpan dari penyimpanan lokal.
 */
export function removeDFAFromStorage(
    storage: StorageLike,
    key: string = DFA_STORAGE_KEY,
): void {
    storage.removeItem(key);
}
