
/**
 * Otomata Lab — Level 2
 * Logika inti untuk pemeriksaan keanggotaan bahasa formal.
 *
 * Semua bahasa bawaan menggunakan alfabet Σ = {a, b}.
 * File ini tidak bergantung pada React maupun browser.
 */

import {
    isValidString,
    length,
    sigmaStar,
    type Alphabet,
} from "./alphabet";

/**
 * Representasi sebuah bahasa formal.
 */
export interface Language {
    id: string;
    name: string;
    sigma: Alphabet;
    accepts: (w: string) => boolean;
}

/**
 * Tipe fungsi yang digunakan untuk menentukan aturan bahasa.
 */
type LanguageRule = (w: string) => boolean;

const ALPHABET_AB: Alphabet = ["a", "b"];

/**
 * Membuat bahasa dengan aturan tertentu.
 *
 * String hanya dapat diterima jika seluruh simbolnya
 * termasuk dalam alfabet bahasa tersebut dan memenuhi aturan.
 */
function createLanguage(
    id: string,
    name: string,
    rule: LanguageRule,
): Language {
    const sigma: Alphabet = [...ALPHABET_AB];

    return {
        id,
        name,
        sigma,
        accepts: (w: string): boolean =>
            isValidString(w, sigma) && rule(w),
    };
}

/**
 * Lima bahasa bawaan sesuai spesifikasi Level 2.
 *
 * 1. Diawali a.
 * 2. Diakhiri b.
 * 3. Memiliki panjang tepat dua.
 * 4. Hanya berisi b.
 * 5. Memiliki jumlah simbol a genap.
 */
export const PRESET_LANGUAGES: Language[] = [
    createLanguage(
        "starts-with-a",
        "Diawali a",
        (w) => w.startsWith("a"),
    ),

    createLanguage(
        "ends-with-b",
        "Diakhiri b",
        (w) => w.endsWith("b"),
    ),

    createLanguage(
        "length-exactly-two",
        "Panjang tepat 2",
        (w) => length(w) === 2,
    ),

    createLanguage(
        "only-b",
        "Hanya berisi b",
        (w) =>
            Array.from(w).every((symbol) => symbol === "b"),
    ),

    createLanguage(
        "even-number-of-a",
        "Jumlah a genap",
        (w) =>
            Array.from(w).filter((symbol) => symbol === "a").length %
            2 ===
            0,
    ),
];

/**
 * Menghasilkan semua string yang menjadi anggota bahasa
 * sampai panjang maksimal tertentu.
 *
 * Urutan string mengikuti urutan alfabet, dimulai dari ε.
 *
 * Contoh:
 * membersUpTo(PRESET_LANGUAGES[1], 2)
 * menghasilkan ["b", "ab", "bb"].
 *
 * Parameter maxLen harus berupa bilangan bulat non-negatif.
 */
export function membersUpTo(
    lang: Language,
    maxLen: number,
): string[] {
    const candidates = sigmaStar(lang.sigma, maxLen);

    return candidates.filter((w) => lang.accepts(w));
}
