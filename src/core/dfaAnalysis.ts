
/**
 * Otomata Lab — Analisis DFA
 * Mendukung bonus B5 dan B6.
 *
 * Seluruh analisis dilakukan berdasarkan state dan transisi DFA,
 * tanpa bergantung pada React maupun antarmuka browser.
 */

import {
    validateDFA,
    type DFA,
    type State,
} from "./dfa";

/**
 * Memastikan DFA valid sebelum dianalisis.
 */
function pastikanDFAValid(dfa: DFA): void {
    if (
        !dfa ||
        !Array.isArray(dfa.states) ||
        !Array.isArray(dfa.alphabet) ||
        !Array.isArray(dfa.accepting) ||
        !dfa.transitions ||
        typeof dfa.transitions !== "object"
    ) {
        throw new Error("Struktur data DFA tidak valid.");
    }

    if (dfa.states.length === 0) {
        throw new Error("DFA harus mempunyai minimal satu state.");
    }

    if (new Set(dfa.states).size !== dfa.states.length) {
        throw new Error("DFA tidak boleh mempunyai state duplikat.");
    }

    if (new Set(dfa.alphabet).size !== dfa.alphabet.length) {
        throw new Error("Alfabet DFA tidak boleh mempunyai simbol duplikat.");
    }

    if (
        dfa.alphabet.some(
            (simbol) => typeof simbol !== "string" || simbol.length === 0,
        )
    ) {
        throw new Error("Alfabet DFA mempunyai simbol yang tidak valid.");
    }

    const masalah = validateDFA(dfa);

    if (masalah.length > 0) {
        throw new Error(
            `DFA tidak valid:\n${masalah
                .map((item) => item.message)
                .join("\n")}`,
        );
    }
}

/**
 * Menelusuri state yang dapat dicapai dari state awal
 * menggunakan algoritma BFS.
 *
 * Fungsi ini hanya dipanggil setelah DFA dinyatakan valid.
 */
function cariStateTerjangkau(dfa: DFA): Set<State> {
    const terjangkau = new Set<State>([dfa.start]);
    const antrean: State[] = [dfa.start];

    let indeks = 0;

    while (indeks < antrean.length) {
        const state = antrean[indeks++];

        for (const simbol of dfa.alphabet) {
            const tujuan = dfa.transitions[state][simbol];

            if (!terjangkau.has(tujuan)) {
                terjangkau.add(tujuan);
                antrean.push(tujuan);
            }
        }
    }

    return terjangkau;
}

/**
 * Mengembalikan seluruh state yang tidak dapat dicapai
 * dari state awal DFA.
 *
 * Contoh:
 * findUnreachableStates(dfa) menghasilkan ["q3"]
 * apabila q3 tidak dapat dicapai dari state awal.
 */
export function findUnreachableStates(dfa: DFA): State[] {
    pastikanDFAValid(dfa);

    const terjangkau = cariStateTerjangkau(dfa);

    return dfa.states.filter(
        (state) => !terjangkau.has(state),
    );
}

/**
 * Pilihan untuk membatasi pencarian contoh string.
 */
export interface ExampleGenerationOptions {
    /** Jumlah contoh yang dicari untuk setiap kategori. */
    count?: number;

    /** Panjang maksimum berdasarkan jumlah simbol yang dibaca. */
    maxLength?: number;

    /** Jumlah maksimum kandidat yang boleh dibuat dan diperiksa. */
    maxCandidates?: number;
}

/**
 * Hasil pencarian contoh string.
 */
export interface ShortestExamples {
    /** String terpendek yang diterima. String kosong mewakili epsilon. */
    accepted: string[];

    /** String terpendek yang ditolak. String kosong mewakili epsilon. */
    rejected: string[];

    /** Jumlah kandidat yang sudah diperiksa. */
    examined: number;

    /** Bernilai true jika hasil yang diminta belum ditemukan seluruhnya. */
    truncated: boolean;

    /** Batas panjang input dalam jumlah simbol. */
    maxLength: number;
}

/**
 * Mengubah urutan simbol menjadi teks untuk ditampilkan.
 *
 * Simbol satu karakter digabung tanpa pemisah.
 * Simbol yang terdiri dari beberapa karakter dipisahkan spasi.
 * Urutan kosong direpresentasikan sebagai string kosong (epsilon).
 */
function formatSimbol(simbol: string[]): string {
    if (simbol.length === 0) {
        return "";
    }

    const memilikiSimbolPanjang = simbol.some(
        (item) => Array.from(item).length !== 1,
    );

    return memilikiSimbolPanjang
        ? simbol.join(" ")
        : simbol.join("");
}

/**
 * Mencari hingga lima contoh string terpendek yang diterima
 * dan lima contoh yang ditolak.
 *
 * BFS memastikan kandidat diproses dari panjang input terpendek
 * menuju panjang yang lebih besar.
 *
 * Pencarian dibatasi oleh maxLength dan maxCandidates untuk
 * menghindari penggunaan memori serta waktu yang berlebihan.
 *
 * Properti truncated bernilai true apabila jumlah contoh yang
 * diminta belum ditemukan seluruhnya.
 */
export function generateShortestExamples(
    dfa: DFA,
    options: ExampleGenerationOptions = {},
): ShortestExamples {
    pastikanDFAValid(dfa);

    const count = options.count ?? 5;
    const maxLength =
        options.maxLength ?? Math.max(8, dfa.states.length + count);
    const maxCandidates = options.maxCandidates ?? 100_000;

    if (!Number.isInteger(count) || count < 1) {
        throw new RangeError(
            "count harus berupa bilangan bulat positif.",
        );
    }

    if (!Number.isInteger(maxLength) || maxLength < 0) {
        throw new RangeError(
            "maxLength harus berupa bilangan bulat non-negatif.",
        );
    }

    if (!Number.isInteger(maxCandidates) || maxCandidates < 1) {
        throw new RangeError(
            "maxCandidates harus berupa bilangan bulat positif.",
        );
    }

    const stateTerjangkau = cariStateTerjangkau(dfa);
    const stateAkhir = new Set(dfa.accepting);

    const dapatMencapaiAkhir = [...stateTerjangkau].some(
        (state) => stateAkhir.has(state),
    );

    const dapatMencapaiBukanAkhir = [...stateTerjangkau].some(
        (state) => !stateAkhir.has(state),
    );

    const accepted: string[] = [];
    const rejected: string[] = [];

    const acceptedSet = new Set<string>();
    const rejectedSet = new Set<string>();

    /**
     * Setiap simpul antrean menyimpan state saat ini,
     * urutan simbol yang membentuk input, dan panjang input.
     */
    interface SimpulPencarian {
        state: State;
        symbols: string[];
        depth: number;
    }

    const antrean: SimpulPencarian[] = [
        {
            state: dfa.start,
            symbols: [],
            depth: 0,
        },
    ];

    let indeks = 0;
    let examined = 0;
    let jumlahDibuat = 1;

    /**
     * Memeriksa apakah kedua kategori sudah lengkap
     * atau tidak mungkin mempunyai anggota.
     */
    function hasilSudahLengkap(): boolean {
        const acceptedSelesai =
            !dapatMencapaiAkhir || accepted.length >= count;

        const rejectedSelesai =
            !dapatMencapaiBukanAkhir || rejected.length >= count;

        return acceptedSelesai && rejectedSelesai;
    }

    while (
        indeks < antrean.length &&
        examined < maxCandidates &&
        !hasilSudahLengkap()
    ) {
        const simpul = antrean[indeks++];

        examined++;

        const teks = formatSimbol(simpul.symbols);
        const diterima = stateAkhir.has(simpul.state);

        if (diterima) {
            if (
                !acceptedSet.has(teks) &&
                accepted.length < count
            ) {
                accepted.push(teks);
                acceptedSet.add(teks);
            }
        } else if (
            !rejectedSet.has(teks) &&
            rejected.length < count
        ) {
            rejected.push(teks);
            rejectedSet.add(teks);
        }

        // Input tidak boleh dikembangkan jika panjangnya sudah mencapai batas.
        if (simpul.depth >= maxLength) {
            continue;
        }

        // Membatasi jumlah kandidat yang dimasukkan ke antrean.
        for (const simbol of dfa.alphabet) {
            if (jumlahDibuat >= maxCandidates) {
                break;
            }

            antrean.push({
                state: dfa.transitions[simpul.state][simbol],
                symbols: [...simpul.symbols, simbol],
                depth: simpul.depth + 1,
            });

            jumlahDibuat++;
        }
    }

    return {
        accepted,
        rejected,
        examined,
        truncated: !hasilSudahLengkap(),
        maxLength,
    };
}
