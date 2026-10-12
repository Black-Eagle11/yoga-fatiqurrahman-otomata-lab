/**
 * Otomata Lab — Level 3
 * Empat DFA bawaan berdasarkan materi perkuliahan.
 *
 * Setiap DFA direpresentasikan dengan model 5-tuple:
 * M = (Q, Σ, δ, q0, F).
 */

import type { DFA } from "./dfa";

/**
 * Contoh 1: menerima string yang diakhiri simbol 1.
 *
 * State awal: q0
 * State akhir: q1
 * Alfabet: {0, 1}
 */
export const endsWithOneDFA: DFA = {
    name: "Diakhiri 1",
    states: ["q0", "q1"],
    alphabet: ["0", "1"],

    transitions: {
        q0: {
            "0": "q0",
            "1": "q1",
        },
        q1: {
            "0": "q0",
            "1": "q1",
        },
    },

    start: "q0",
    accepting: ["q1"],
};

/**
 * Contoh 2: menerima string yang diawali simbol a.
 *
 * State awal: q0
 * State akhir: q1
 * q2 merupakan dead state.
 * Alfabet: {a, b}
 */
export const startsWithADFA: DFA = {
    name: "Diawali a",
    states: ["q0", "q1", "q2"],
    alphabet: ["a", "b"],

    transitions: {
        q0: {
            a: "q1",
            b: "q2",
        },
        q1: {
            a: "q1",
            b: "q1",
        },
        q2: {
            a: "q2",
            b: "q2",
        },
    },

    start: "q0",
    accepting: ["q1"],
};

/**
 * Contoh 3: menerima string dengan jumlah simbol a genap.
 *
 * State awal sekaligus state akhir: q0.
 * q0 merepresentasikan jumlah a genap.
 * q1 merepresentasikan jumlah a ganjil.
 * Alfabet: {a, b}
 */
export const evenNumberOfADFA: DFA = {
    name: "Jumlah a Genap",
    states: ["q0", "q1"],
    alphabet: ["a", "b"],

    transitions: {
        q0: {
            a: "q1",
            b: "q0",
        },
        q1: {
            a: "q0",
            b: "q1",
        },
    },

    start: "q0",
    accepting: ["q0"],
};

/**
 * Contoh 4: aturan menulis Aksara Bali versi sederhana.
 *
 * K melambangkan aksara konsonan.
 * V melambangkan tanda vokal.
 *
 * State awal: q0
 * State akhir: q1 dan q2
 * q3 merupakan dead state.
 * Alfabet: {K, V}
 *
 * Model ini mengikuti tabel transisi pada dokumen tugas
 * dan bukan pemeriksa tata bahasa Aksara Bali secara lengkap.
 */
export const baliWritingDFA: DFA = {
    name: "Aturan Menulis Aksara Bali",
    states: ["q0", "q1", "q2", "q3"],
    alphabet: ["K", "V"],

    transitions: {
        q0: {
            K: "q1",
            V: "q3",
        },
        q1: {
            K: "q1",
            V: "q2",
        },
        q2: {
            K: "q1",
            V: "q3",
        },
        q3: {
            K: "q3",
            V: "q3",
        },
    },

    start: "q0",
    accepting: ["q1", "q2"],
};

/**
 * Daftar seluruh DFA bawaan untuk digunakan dalam aplikasi.
 */
export const PRESET_DFAS: DFA[] = [
    endsWithOneDFA,
    startsWithADFA,
    evenNumberOfADFA,
    baliWritingDFA,
];
