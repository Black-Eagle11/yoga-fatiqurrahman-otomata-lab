
/**
 * Otomata Lab — Pengujian seluruh logika inti.
 *
 * Pengujian mencakup:
 * - Level 1: alfabet dan string.
 * - Level 2: pemeriksaan bahasa.
 * - Level 3: mesin DFA dan empat preset.
 * - Bonus B2: penyimpanan dan pemuatan JSON.
 * - Bonus B5: pencarian contoh string terpendek.
 * - Bonus B6: deteksi state yang tidak terjangkau.
 * - Bonus B7: logika NFA.
 * - Level 5: DFA pintu otomatis.
 */

import { describe, expect, it } from "vitest";

import {
    parseAlphabet,
    isValidString,
    length,
    concat,
    sigmaN,
    sigmaStar,
} from "../src/core/alphabet";

import {
    PRESET_LANGUAGES,
    membersUpTo,
} from "../src/core/language";

import {
    validateDFA,
    delta,
    run,
    runSymbols,
    formatTrace,
    findDeadStates,
    type DFA,
} from "../src/core/dfa";

import {
    endsWithOneDFA,
    startsWithADFA,
    evenNumberOfADFA,
    baliWritingDFA,
    PRESET_DFAS,
} from "../src/core/presets";

import {
    findUnreachableStates,
    generateShortestExamples,
} from "../src/core/dfaAnalysis";

import {
    serializeDFA,
    deserializeDFA,
    saveDFAToStorage,
    loadDFAFromStorage,
    removeDFAFromStorage,
    type StorageLike,
} from "../src/core/dfaPersistence";

import {
    validateNFA,
    hasNondeterministicTransition,
    runNFA,
    type NFA,
} from "../src/core/nfa";

import {
    DOOR_EVENTS,
    automaticDoorDFA,
    validateAutomaticDoor,
    applyDoorEvent,
    runDoorEvents,
    getDoorStateAfterEvents,
} from "../src/core/automaticDoor";

/**
 * Membuat penyimpanan tiruan untuk menguji fungsi penyimpanan
 * tanpa bergantung pada localStorage milik browser.
 */
function buatPenyimpananTiruan(): StorageLike {
    const data = new Map<string, string>();

    return {
        getItem(key) {
            return data.get(key) ?? null;
        },

        setItem(key, value) {
            data.set(key, value);
        },

        removeItem(key) {
            data.delete(key);
        },
    };
}

/**
 * DFA contoh untuk menguji state yang tidak terjangkau.
 */
const dfaDenganStateTakTerjangkau: DFA = {
    name: "DFA dengan State Tak Terjangkau",
    states: ["q0", "q1", "q2"],
    alphabet: ["0", "1"],

    transitions: {
        q0: {
            "0": "q0",
            "1": "q1",
        },
        q1: {
            "0": "q1",
            "1": "q1",
        },
        q2: {
            "0": "q2",
            "1": "q2",
        },
    },

    start: "q0",
    accepting: ["q1"],
};

/**
 * NFA dengan dua kemungkinan state tujuan saat membaca a.
 */
const contohNFA: NFA = {
    name: "NFA Contoh",
    states: ["q0", "q1", "q2"],
    alphabet: ["a"],

    transitions: {
        q0: {
            a: ["q1", "q2"],
        },
        q1: {
            a: ["q1"],
        },
        q2: {
            a: [],
        },
    },

    start: "q0",
    accepting: ["q2"],
};

describe("Level 1 — Alfabet dan string", () => {
    it("mem-parsing alfabet yang dipisahkan koma", () => {
        expect(parseAlphabet("a, b")).toEqual(["a", "b"]);
    });

    it("menolak alfabet kosong", () => {
        expect(() => parseAlphabet("")).toThrow();
    });

    it("menolak simbol duplikat", () => {
        expect(() => parseAlphabet("a, b, a")).toThrow();
    });

    it("menolak simbol kosong pada daftar alfabet", () => {
        expect(() => parseAlphabet("a,,b")).toThrow();
    });

    it("menolak simbol yang terdiri dari beberapa karakter", () => {
        expect(() => parseAlphabet("abc, b")).toThrow();
    });

    it("memvalidasi string berdasarkan alfabet", () => {
        expect(isValidString("abba", ["a", "b"])).toBe(true);
        expect(isValidString("abc", ["a", "b"])).toBe(false);
    });

    it("menganggap string kosong sebagai anggota Sigma bintang", () => {
        expect(isValidString("", ["a", "b"])).toBe(true);
    });

    it("menghitung panjang string", () => {
        expect(length("abba")).toBe(4);
        expect(length("b")).toBe(1);
        expect(length("")).toBe(0);
    });

    it("melakukan konkatenasi dalam urutan yang benar", () => {
        expect(concat("ab", "bb")).toBe("abbb");
        expect(concat("bb", "ab")).toBe("bbab");
        expect(concat("ab", "")).toBe("ab");
        expect(concat("", "ab")).toBe("ab");
    });

    it("menghasilkan seluruh string Sigma pangkat n", () => {
        expect(sigmaN(["a", "b"], 2)).toEqual([
            "aa",
            "ab",
            "ba",
            "bb",
        ]);
    });

    it("menghasilkan epsilon untuk Sigma pangkat nol", () => {
        expect(sigmaN(["a", "b"], 0)).toEqual([""]);
    });

    it("menolak nilai n negatif", () => {
        expect(() => sigmaN(["a", "b"], -1)).toThrow(RangeError);
    });

    it("menghasilkan Sigma bintang sampai panjang dua", () => {
        expect(sigmaStar(["a", "b"], 2)).toEqual([
            "",
            "a",
            "b",
            "aa",
            "ab",
            "ba",
            "bb",
        ]);
    });

    it("menolak batas panjang Sigma bintang yang tidak valid", () => {
        expect(() => sigmaStar(["a", "b"], -1)).toThrow(RangeError);
    });
});

describe("Level 2 — Pemeriksaan bahasa", () => {
    it("menyediakan minimal lima preset bahasa", () => {
        expect(PRESET_LANGUAGES.length).toBeGreaterThanOrEqual(5);
    });

    it("mempunyai ID bahasa yang unik", () => {
        const ids = PRESET_LANGUAGES.map((bahasa) => bahasa.id);

        expect(new Set(ids).size).toBe(ids.length);
    });

    it("memeriksa bahasa yang diawali a", () => {
        const bahasa = PRESET_LANGUAGES.find(
            (item) => item.id === "starts-with-a",
        )!;

        expect(bahasa.accepts("abb")).toBe(true);
        expect(bahasa.accepts("bab")).toBe(false);
        expect(bahasa.accepts("")).toBe(false);
    });

    it("memeriksa bahasa yang diakhiri b", () => {
        const bahasa = PRESET_LANGUAGES.find(
            (item) => item.id === "ends-with-b",
        )!;

        expect(bahasa.accepts("ab")).toBe(true);
        expect(bahasa.accepts("bbb")).toBe(true);
        expect(bahasa.accepts("ba")).toBe(false);
        expect(bahasa.accepts("")).toBe(false);
    });

    it("memeriksa bahasa dengan panjang tepat dua", () => {
        const bahasa = PRESET_LANGUAGES.find(
            (item) => item.id === "length-exactly-two",
        )!;

        expect(bahasa.accepts("ab")).toBe(true);
        expect(bahasa.accepts("a")).toBe(false);
        expect(bahasa.accepts("aba")).toBe(false);
    });

    it("memeriksa bahasa yang hanya berisi b", () => {
        const bahasa = PRESET_LANGUAGES.find(
            (item) => item.id === "only-b",
        )!;

        expect(bahasa.accepts("bbb")).toBe(true);
        expect(bahasa.accepts("ba")).toBe(false);
        expect(bahasa.accepts("")).toBe(true);
    });

    it("memeriksa bahasa dengan jumlah a genap", () => {
        const bahasa = PRESET_LANGUAGES.find(
            (item) => item.id === "even-number-of-a",
        )!;

        expect(bahasa.accepts("")).toBe(true);
        expect(bahasa.accepts("abba")).toBe(true);
        expect(bahasa.accepts("baaa")).toBe(false);
    });

    it("menolak simbol asing pada seluruh bahasa bawaan", () => {
        for (const bahasa of PRESET_LANGUAGES) {
            expect(bahasa.accepts("ac")).toBe(false);
        }
    });

    it("menghasilkan anggota bahasa yang diakhiri b", () => {
        const bahasa = PRESET_LANGUAGES.find(
            (item) => item.id === "ends-with-b",
        )!;

        expect(membersUpTo(bahasa, 2)).toEqual([
            "b",
            "ab",
            "bb",
        ]);
    });
});

describe("Level 3 — Mesin DFA", () => {
    it("memvalidasi empat preset", () => {
        for (const dfa of PRESET_DFAS) {
            expect(validateDFA(dfa)).toEqual([]);
        }
    });

    it("menyediakan empat preset DFA", () => {
        expect(PRESET_DFAS).toHaveLength(4);
    });

    it("menghitung transisi dengan fungsi delta", () => {
        expect(delta(endsWithOneDFA, "q0", "1")).toBe("q1");
        expect(delta(endsWithOneDFA, "q1", "0")).toBe("q0");
    });

    it("menolak simbol di luar alfabet DFA", () => {
        expect(() => delta(endsWithOneDFA, "q0", "2")).toThrow();
    });

    it("menerima string 101 pada DFA diakhiri 1", () => {
        expect(run(endsWithOneDFA, "101").accepted).toBe(true);
    });

    it("menolak string 110 pada DFA diakhiri 1", () => {
        expect(run(endsWithOneDFA, "110").accepted).toBe(false);
    });

    it("memutuskan penerimaan setelah seluruh string dibaca", () => {
        expect(run(endsWithOneDFA, "").accepted).toBe(false);
        expect(run(evenNumberOfADFA, "").accepted).toBe(true);
    });

    it("menerima abb dan menolak bab pada DFA diawali a", () => {
        expect(run(startsWithADFA, "abb").accepted).toBe(true);
        expect(run(startsWithADFA, "bab").accepted).toBe(false);
    });

    it("memeriksa jumlah a genap", () => {
        expect(run(evenNumberOfADFA, "abba").accepted).toBe(true);
        expect(run(evenNumberOfADFA, "baaa").accepted).toBe(false);
    });

    it("memeriksa aturan penulisan Aksara Bali", () => {
        expect(run(baliWritingDFA, "KKV").accepted).toBe(true);
        expect(run(baliWritingDFA, "KVK").accepted).toBe(true);
        expect(run(baliWritingDFA, "VK").accepted).toBe(false);
        expect(run(baliWritingDFA, "KVV").accepted).toBe(false);
    });

    it("menghasilkan jejak simulasi sesuai format materi", () => {
        expect(formatTrace(run(endsWithOneDFA, "101"))).toBe(
            "101 : q0 --1--> q1 --0--> q0 --1--> q1 ⇒ DITERIMA",
        );
    });

    it("mendeteksi simbol asing pada input simulasi", () => {
        const hasil = run(endsWithOneDFA, "102");

        expect(hasil.error).toContain('Simbol "2"');
        expect(hasil.accepted).toBe(false);
    });

    it("mendeteksi q2 sebagai dead state pada DFA diawali a", () => {
        expect(findDeadStates(startsWithADFA)).toEqual(["q2"]);
    });

    it("mendeteksi q3 sebagai dead state pada DFA Aksara Bali", () => {
        expect(findDeadStates(baliWritingDFA)).toEqual(["q3"]);
    });

    it("mendeteksi transisi yang hilang", () => {
        const dfaTidakLengkap = {
            ...endsWithOneDFA,
            transitions: {
                q0: {
                    "0": "q0",
                    "1": "q1",
                },
                q1: {
                    "0": "q0",
                },
            },
        } as unknown as DFA;

        expect(
            validateDFA(dfaTidakLengkap).some(
                (masalah) => masalah.type === "MISSING_TRANSITION",
            ),
        ).toBe(true);
    });
});

describe("Bonus B5 dan B6 — Analisis DFA", () => {
    it("mendeteksi state q2 yang tidak terjangkau", () => {
        expect(
            findUnreachableStates(dfaDenganStateTakTerjangkau),
        ).toEqual(["q2"]);
    });

    it("menghasilkan contoh string terpendek", () => {
        const hasil = generateShortestExamples(
            endsWithOneDFA,
            {
                count: 5,
                maxLength: 3,
                maxCandidates: 100,
            },
        );

        expect(hasil.accepted).toEqual([
            "1",
            "01",
            "11",
            "001",
            "011",
        ]);

        expect(hasil.rejected).toEqual([
            "",
            "0",
            "00",
            "10",
            "000",
        ]);

        expect(hasil.truncated).toBe(false);
    });

    it("memberikan tanda jika batas pencarian tercapai", () => {
        const hasil = generateShortestExamples(
            endsWithOneDFA,
            {
                count: 5,
                maxLength: 3,
                maxCandidates: 1,
            },
        );

        expect(hasil.truncated).toBe(true);
    });

    it("menolak analisis pada DFA yang tidak valid", () => {
        const dfaTidakValid = {
            ...endsWithOneDFA,
            start: "q9",
        };

        expect(() => findUnreachableStates(dfaTidakValid)).toThrow();
    });
});

describe("Bonus B2 — Penyimpanan dan JSON", () => {
    it("mengekspor DFA menjadi JSON yang dapat dibaca kembali", () => {
        const json = serializeDFA(endsWithOneDFA);
        const dfa = deserializeDFA(json);

        expect(dfa).toEqual(endsWithOneDFA);
    });

    it("menolak teks JSON yang rusak", () => {
        expect(() => deserializeDFA("{json rusak")).toThrow();
    });

    it("menolak data JSON yang bukan DFA valid", () => {
        expect(() =>
            deserializeDFA(
                JSON.stringify({
                    name: "DFA Salah",
                    states: ["q0"],
                    alphabet: ["a"],
                    transitions: {},
                    start: "q0",
                    accepting: [],
                }),
            ),
        ).toThrow();
    });

    it("menyimpan dan membaca DFA dari penyimpanan", () => {
        const storage = buatPenyimpananTiruan();

        saveDFAToStorage(endsWithOneDFA, storage);

        expect(loadDFAFromStorage(storage)).toEqual(
            endsWithOneDFA,
        );
    });

    it("menghasilkan null jika belum ada DFA tersimpan", () => {
        const storage = buatPenyimpananTiruan();

        expect(loadDFAFromStorage(storage)).toBeNull();
    });

    it("menghapus DFA yang tersimpan", () => {
        const storage = buatPenyimpananTiruan();

        saveDFAToStorage(endsWithOneDFA, storage);
        removeDFAFromStorage(storage);

        expect(loadDFAFromStorage(storage)).toBeNull();
    });
});

describe("Bonus B7 — NFA", () => {
    it("memvalidasi struktur NFA", () => {
        expect(validateNFA(contohNFA)).toEqual([]);
    });

    it("mendeteksi transisi nondeterministik", () => {
        expect(hasNondeterministicTransition(contohNFA)).toBe(true);
    });

    it("menjalankan NFA dengan beberapa kemungkinan state", () => {
        const hasil = runNFA(contohNFA, "a");

        expect(hasil.accepted).toBe(true);
        expect(hasil.finalStates).toEqual(["q1", "q2"]);
    });

    it("menolak input yang tidak termasuk alfabet", () => {
        const hasil = runNFA(contohNFA, "x");

        expect(hasil.accepted).toBe(false);
        expect(hasil.error).toContain('Simbol "x"');
    });
});

describe("Level 5 — Pintu otomatis", () => {
    it("mempunyai alfabet kejadian sesuai spesifikasi", () => {
        expect(DOOR_EVENTS).toEqual([
            "ADA_ORANG",
            "TIDAK_ADA_ORANG",
        ]);
    });

    it("memiliki DFA pintu yang valid", () => {
        expect(validateAutomaticDoor()).toEqual([]);
        expect(validateDFA(automaticDoorDFA)).toEqual([]);
    });

    it("membuka pintu ketika ada orang", () => {
        expect(
            applyDoorEvent("Tertutup", "ADA_ORANG"),
        ).toBe("Terbuka");
    });

    it("menutup pintu ketika tidak ada orang", () => {
        expect(
            applyDoorEvent("Terbuka", "TIDAK_ADA_ORANG"),
        ).toBe("Tertutup");
    });

    it("memproses rangkaian kejadian dengan benar", () => {
        const hasil = runDoorEvents([
            "ADA_ORANG",
            "TIDAK_ADA_ORANG",
            "ADA_ORANG",
        ]);

        expect(hasil.error).toBeUndefined();
        expect(hasil.finalState).toBe("Terbuka");
        expect(hasil.accepted).toBe(true);
        expect(hasil.steps).toHaveLength(3);
    });

    it("menghasilkan state pintu terakhir dari riwayat kejadian", () => {
        expect(
            getDoorStateAfterEvents([
                "ADA_ORANG",
                "TIDAK_ADA_ORANG",
            ]),
        ).toBe("Tertutup");
    });
});
