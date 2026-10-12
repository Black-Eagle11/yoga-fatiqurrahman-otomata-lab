
/**
 * Otomata Lab — Level 5
 * Studi kasus DFA pintu otomatis.
 *
 * Mesin ini mempunyai dua state:
 * - Tertutup
 * - Terbuka
 *
 * Kejadian yang dibaca:
 * - ADA_ORANG
 * - TIDAK_ADA_ORANG
 *
 * State akhir ditetapkan sebagai Terbuka untuk menandai
 * konfigurasi ketika pintu berada dalam keadaan terbuka.
 */

import {
    delta,
    runSymbols,
    validateDFA,
    type DFA,
    type RunResult,
    type State,
} from "./dfa";

/**
 * Daftar simbol kejadian yang diterima oleh pintu otomatis.
 */
export const DOOR_EVENTS = [
    "ADA_ORANG",
    "TIDAK_ADA_ORANG",
] as const;

/**
 * Tipe kejadian pintu otomatis.
 */
export type DoorEvent = (typeof DOOR_EVENTS)[number];

/**
 * State yang digunakan oleh pintu otomatis.
 */
export type DoorState = "Tertutup" | "Terbuka";

/**
 * Label kejadian yang ditampilkan kepada pengguna.
 */
export const DOOR_EVENT_LABELS: Record<DoorEvent, string> = {
    ADA_ORANG: "Ada orang",
    TIDAK_ADA_ORANG: "Tidak ada orang",
};

/**
 * Definisi DFA pintu otomatis.
 *
 * Alfabet = {ADA_ORANG, TIDAK_ADA_ORANG}
 * State awal = Tertutup
 * State akhir = Terbuka
 *
 * Jika ada orang, pintu terbuka.
 * Jika tidak ada orang, pintu tertutup.
 *
 * Seluruh kombinasi state dan kejadian mempunyai
 * tepat satu state tujuan.
 */
export const automaticDoorDFA: DFA = {
    name: "Pintu Otomatis",

    states: ["Tertutup", "Terbuka"],

    alphabet: [...DOOR_EVENTS],

    transitions: {
        Tertutup: {
            ADA_ORANG: "Terbuka",
            TIDAK_ADA_ORANG: "Tertutup",
        },

        Terbuka: {
            ADA_ORANG: "Terbuka",
            TIDAK_ADA_ORANG: "Tertutup",
        },
    },

    start: "Tertutup",

    accepting: ["Terbuka"],
};

/**
 * Memeriksa apakah definisi DFA pintu otomatis valid.
 *
 * Array kosong berarti tidak ditemukan masalah validasi.
 */
export function validateAutomaticDoor(): ReturnType<
    typeof validateDFA
> {
    return validateDFA(automaticDoorDFA);
}

/**
 * Menentukan state pintu setelah satu kejadian.
 *
 * Fungsi ini berguna untuk tombol kejadian pada antarmuka.
 */
export function applyDoorEvent(
    currentState: DoorState,
    event: DoorEvent,
): DoorState {
    const nextState: State = delta(
        automaticDoorDFA,
        currentState,
        event,
    );

    return nextState as DoorState;
}

/**
 * Menjalankan rangkaian kejadian dari state awal pintu.
 *
 * Contoh:
 * runDoorEvents(["ADA_ORANG", "TIDAK_ADA_ORANG"])
 *
 * Hasil akhirnya adalah state Tertutup.
 */
export function runDoorEvents(
    events: DoorEvent[],
): RunResult {
    return runSymbols(automaticDoorDFA, [...events]);
}

/**
 * Menjalankan kembali riwayat kejadian untuk memperoleh
 * state pintu setelah seluruh kejadian diproses.
 *
 * Fungsi ini mengembalikan state terakhir dari rangkaian
 * kejadian yang diberikan.
 */
export function getDoorStateAfterEvents(
    events: DoorEvent[],
): DoorState {
    const result = runDoorEvents(events);

    if (result.error) {
        throw new Error(result.error);
    }

    return result.finalState as DoorState;
}

/**
 * Menghasilkan label keadaan pintu yang mudah dibaca.
 */
export function getDoorStateLabel(state: DoorState): string {
    return state === "Terbuka"
        ? "Pintu terbuka"
        : "Pintu tertutup";
}
