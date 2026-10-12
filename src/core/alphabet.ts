
/**
 * Otomata Lab — Level 1
 * Logika inti untuk alfabet dan string.
 *
 * Semua fungsi di file ini tidak bergantung pada React
 * maupun antarmuka browser sehingga dapat diuji secara terpisah.
 */

export type Symbol = string;
export type Alphabet = Symbol[];

/**
  Mengubah input alfabet yang dipisahkan koma menjadi array simbol.
 
 Contoh:
 parseAlphabet("a, b") menghasilkan ["a", "b"].
 
  Ketentuan:
  - Alfabet tidak boleh kosong.
  - Setiap simbol harus terdiri dari satu karakter.
  - Simbol kosong dan simbol duplikat ditolak.
 */

export function parseAlphabet(input: string): Alphabet {
    if (input.trim() === "") {
        throw new Error("Alfabet tidak boleh kosong.");
    }

    const symbols = input.split(",").map((symbol) => symbol.trim());

    if (symbols.some((symbol) => symbol.length === 0)) {
        throw new Error("Simbol alfabet tidak boleh kosong.");
    }

    for (const symbol of symbols) {
        if (Array.from(symbol).length !== 1) {
            throw new Error(
                `Simbol "${symbol}" harus terdiri dari tepat satu karakter.`,
            );
        }
    }

    const seen = new Set<string>();

    for (const symbol of symbols) {
        if (seen.has(symbol)) {
            throw new Error(`Simbol "${symbol}" tidak boleh duplikat.`);
        }

        seen.add(symbol);
    }

    return symbols;
}

/**
 * Memeriksa apakah semua simbol dalam string termasuk alfabet.
 *
 * String kosong atau epsilon selalu valid karena ε merupakan
 * anggota Σ*, termasuk ketika alfabetnya kosong.
 */
export function isValidString(
    w: string,
    sigma: Alphabet,
): boolean {
    const allowedSymbols = new Set(sigma);

    return Array.from(w).every((symbol) =>
        allowedSymbols.has(symbol),
    );
}

/**
 * Menghitung panjang string berdasarkan jumlah karakter.
 *
 * Contoh:
 * length("abba") menghasilkan 4.
 * length("b") menghasilkan 1.
 * length("") menghasilkan 0.
 */
export function length(w: string): number {
    return Array.from(w).length;
}

/**
 * Menggabungkan dua string secara berurutan.
 *
 * Contoh:
 * concat("ab", "bb") menghasilkan "abbb".
 * concat("ab", "") menghasilkan "ab".
 *
 * Konkatenasi tidak bersifat komutatif.
 */
export function concat(w: string, v: string): string {
    return w + v;
}

/**
 * Memastikan panjang yang diberikan merupakan bilangan bulat
 * non-negatif.
 */
function validateLength(n: number, namaParameter: string): void {
    if (!Number.isInteger(n) || n < 0) {
        throw new RangeError(
            `${namaParameter} harus berupa bilangan bulat non-negatif.`,
        );
    }
}

/**
 * Menghasilkan semua string yang panjangnya tepat n
 * berdasarkan alfabet yang diberikan.
 *
 * Contoh:
 * sigmaN(["a", "b"], 2)
 * menghasilkan ["aa", "ab", "ba", "bb"].
 *
 * Σ⁰ = {ε}, yang direpresentasikan oleh string kosong "".
 */
export function sigmaN(
    sigma: Alphabet,
    n: number,
): string[] {
    validateLength(n, "n");

    let result: string[] = [""];

    for (let i = 0; i < n; i++) {
        const next: string[] = [];

        for (const prefix of result) {
            for (const symbol of sigma) {
                next.push(prefix + symbol);
            }
        }

        result = next;
    }

    return result;
}

/**
 * Menghasilkan seluruh string dalam Σ* sampai panjang maksimal
 * yang diberikan, diurutkan dari panjang terpendek.
 *
 * Contoh:
 * sigmaStar(["a", "b"], 2)
 * menghasilkan:
 * ["", "a", "b", "aa", "ab", "ba", "bb"].
 *
 * String kosong "" merepresentasikan epsilon (ε).
 */
export function sigmaStar(
    sigma: Alphabet,
    maxLen: number,
): string[] {
    validateLength(maxLen, "maxLen");

    const result: string[] = [];

    for (let n = 0; n <= maxLen; n++) {
        result.push(...sigmaN(sigma, n));
    }

    return result;
}
