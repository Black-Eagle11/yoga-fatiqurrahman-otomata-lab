
/**
 * Otomata Lab — Level 4
 * Visualisasi diagram DFA menggunakan SVG.
 *
 * Diagram membaca objek DFA dari DFAWorkbench agar
 * selalu mengikuti perubahan tabel transisi.
 */

import { useId, useMemo } from "react";

import {
    validateDFA,
    type DFA,
    type State,
    type TraceStep,
} from "../core/dfa";

interface StateDiagramProps {
    dfa: DFA;
    activeState: State | null;
    activeTransition: TraceStep | null;
}

interface Titik {
    x: number;
    y: number;
}

interface TransisiGabungan {
    from: State;
    to: State;
    symbols: string[];
}

interface TransisiBergambar extends TransisiGabungan {
    key: string;
}

/**
 * Ukuran dasar diagram.
 */
const LEBAR = 900;
const TINGGI = 600;
const PUSAT_X = LEBAR / 2;
const PUSAT_Y = 305;
const JARI_JARI_LINGKARAN = 40;
const JARI_JARI_LAYOUT = 210;

/**
 * Membentuk kunci unik untuk pasangan state asal dan tujuan.
 */
function kunciTransisi(from: State, to: State): string {
    return JSON.stringify([from, to]);
}

/**
 * Membuat ID SVG yang aman untuk marker panah.
 */
function buatIdSvg(id: string): string {
    return `dfa-${id.replace(/[^a-zA-Z0-9_-]/g, "")}`;
}

export default function StateDiagram({
    dfa,
    activeState,
    activeTransition,
}: StateDiagramProps) {
    const idUnik = buatIdSvg(useId());

    const masalahValidasi = useMemo(
        () => validateDFA(dfa),
        [dfa],
    );

    /**
     * Menentukan posisi setiap state pada lingkaran.
     */
    const posisiState = useMemo<Record<State, Titik>>(() => {
        const posisi = {} as Record<State, Titik>;

        if (dfa.states.length === 1) {
            posisi[dfa.states[0]!] = {
                x: PUSAT_X,
                y: PUSAT_Y,
            };

            return posisi;
        }

        dfa.states.forEach((state, indeks) => {
            const sudut =
                -Math.PI / 2 +
                (2 * Math.PI * indeks) / dfa.states.length;

            posisi[state] = {
                x: PUSAT_X + JARI_JARI_LAYOUT * Math.cos(sudut),
                y: PUSAT_Y + JARI_JARI_LAYOUT * Math.sin(sudut),
            };
        });

        return posisi;
    }, [dfa.states]);

    /**
     * Menggabungkan beberapa simbol apabila memiliki
     * pasangan state asal dan tujuan yang sama.
     */
    const transisiGabungan = useMemo<TransisiBergambar[]>(() => {
        const hasil = new Map<string, TransisiGabungan>();

        for (const from of dfa.states) {
            for (const symbol of dfa.alphabet) {
                const to = dfa.transitions[from]?.[symbol];

                // Transisi yang belum valid tidak digambarkan sebagai panah.
                if (
                    typeof to !== "string" ||
                    !dfa.states.includes(to)
                ) {
                    continue;
                }

                const key = kunciTransisi(from, to);
                const transisi = hasil.get(key);

                if (transisi) {
                    transisi.symbols.push(symbol);
                } else {
                    hasil.set(key, {
                        from,
                        to,
                        symbols: [symbol],
                    });
                }
            }
        }

        return Array.from(hasil.entries()).map(([key, item]) => ({
            ...item,
            key,
        }));
    }, [dfa]);

    if (dfa.states.length === 0) {
        return (
            <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-600 dark:border-slate-700 dark:text-slate-400">
                Tambahkan minimal satu state untuk menampilkan diagram DFA.
            </div>
        );
    }

    /**
     * Memeriksa apakah transisi tertentu sedang disorot simulator.
     */
    function transisiAktif(
        transisi: TransisiGabungan,
    ): boolean {
        return (
            activeTransition !== null &&
            activeTransition.from === transisi.from &&
            activeTransition.to === transisi.to &&
            transisi.symbols.includes(activeTransition.symbol)
        );
    }

    /**
     * Menghitung jalur panah dari satu state ke state lain.
     */
    function gambarTransisi(
        transisi: TransisiBergambar,
    ): {
        jalur: string;
        label: Titik;
        melingkar: boolean;
    } {
        const from = posisiState[transisi.from]!;
        const to = posisiState[transisi.to]!;

        /**
         * Self-loop digambar sebagai kurva di luar lingkaran state.
         */
        if (transisi.from === transisi.to) {
            const dx = from.x - PUSAT_X;
            const dy = from.y - PUSAT_Y;
            const jarak = Math.hypot(dx, dy) || 1;

            const radial = {
                x: dx / jarak,
                y: dy / jarak,
            };

            const tangent = {
                x: -radial.y,
                y: radial.x,
            };

            const p1 = {
                x: from.x + tangent.x * 20,
                y: from.y + tangent.y * 20,
            };

            const p2 = {
                x: from.x - tangent.x * 20,
                y: from.y - tangent.y * 20,
            };

            const c1 = {
                x: from.x + tangent.x * 48 + radial.x * 58,
                y: from.y + tangent.y * 48 + radial.y * 58,
            };

            const c2 = {
                x: from.x - tangent.x * 48 + radial.x * 58,
                y: from.y - tangent.y * 48 + radial.y * 58,
            };

            return {
                jalur: `M ${p1.x} ${p1.y} C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${p2.x} ${p2.y}`,
                label: {
                    x: from.x + radial.x * 77,
                    y: from.y + radial.y * 77,
                },
                melingkar: true,
            };
        }

        /**
         * Menghitung titik awal dan akhir panah agar berada
         * di tepi lingkaran, bukan tepat di pusat state.
         */
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const jarak = Math.hypot(dx, dy) || 1;

        const unit = {
            x: dx / jarak,
            y: dy / jarak,
        };

        const normal = {
            x: -unit.y,
            y: unit.x,
        };

        const titikAwal = {
            x: from.x + unit.x * JARI_JARI_LINGKARAN,
            y: from.y + unit.y * JARI_JARI_LINGKARAN,
        };

        const titikAkhir = {
            x: to.x - unit.x * JARI_JARI_LINGKARAN,
            y: to.y - unit.y * JARI_JARI_LINGKARAN,
        };

        /**
         * Jika ada panah balik, kedua arah diberi lengkungan
         * agar tidak saling menumpuk.
         */
        const adaPanahBalik = transisiGabungan.some(
            (item) =>
                item.from === transisi.to &&
                item.to === transisi.from,
        );

        const lengkungan = adaPanahBalik ? 48 : 0;

        const titikKontrol = {
            x:
                (titikAwal.x + titikAkhir.x) / 2 +
                normal.x * lengkungan,
            y:
                (titikAwal.y + titikAkhir.y) / 2 +
                normal.y * lengkungan,
        };

        const posisiLabel = {
            x: titikKontrol.x + normal.x * 19,
            y: titikKontrol.y + normal.y * 19,
        };

        return {
            jalur:
                `M ${titikAwal.x} ${titikAwal.y} ` +
                `Q ${titikKontrol.x} ${titikKontrol.y} ` +
                `${titikAkhir.x} ${titikAkhir.y}`,
            label: posisiLabel,
            melingkar: false,
        };
    }

    /**
     * Membuat panah masuk dari luar untuk state awal.
     */
    function gambarPanahAwal(state: State): {
        jalur: string;
        label: Titik;
    } {
        const titik = posisiState[state]!;

        let dx = titik.x - PUSAT_X;
        let dy = titik.y - PUSAT_Y;
        let jarak = Math.hypot(dx, dy);

        if (jarak === 0) {
            dx = 0;
            dy = -1;
            jarak = 1;
        }

        const radial = {
            x: dx / jarak,
            y: dy / jarak,
        };

        const tangent = {
            x: -radial.y,
            y: radial.x,
        };

        const awal = {
            x: titik.x - radial.x * 96 + tangent.x * 43,
            y: titik.y - radial.y * 96 + tangent.y * 43,
        };

        const akhir = {
            x: titik.x - radial.x * 29 + tangent.x * 12,
            y: titik.y - radial.y * 29 + tangent.y * 12,
        };

        return {
            jalur: `M ${awal.x} ${awal.y} L ${akhir.x} ${akhir.y}`,
            label: {
                x: awal.x + tangent.x * 15,
                y: awal.y + tangent.y * 15,
            },
        };
    }

    const panahAwal = gambarPanahAwal(dfa.start);

    return (
        <div className="space-y-4">
            {/* Peringatan jika struktur DFA belum valid */}
            {masalahValidasi.length > 0 && (
                <div
                    role="status"
                    className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200"
                >
                    Diagram hanya menggambarkan transisi yang mempunyai
                    tujuan state terdaftar. Lengkapi semua transisi agar
                    diagram mewakili DFA yang valid.
                </div>
            )}

            {/* Keterangan simbol diagram */}
            <div className="flex flex-wrap gap-3 text-xs text-slate-600 dark:text-slate-400">
                <span className="rounded-md bg-slate-100 px-2 py-1 dark:bg-slate-800">
                    → State awal
                </span>

                <span className="rounded-md bg-slate-100 px-2 py-1 dark:bg-slate-800">
                    Lingkaran ganda = state akhir
                </span>

                <span className="rounded-md bg-amber-50 px-2 py-1 text-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
                    Sorotan = simulasi aktif
                </span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-950">
                <svg
                    viewBox={`0 0 ${LEBAR} ${TINGGI}`}
                    role="img"
                    aria-label={`Diagram state untuk DFA ${dfa.name}`}
                    className="block h-auto w-full min-w-[620px]"
                >
                    <defs>
                        {/* Marker panah untuk transisi biasa */}
                        <marker
                            id={`${idUnik}-arrow`}
                            markerWidth="10"
                            markerHeight="10"
                            refX="8"
                            refY="5"
                            orient="auto"
                            markerUnits="userSpaceOnUse"
                        >
                            <path
                                d="M 0 0 L 10 5 L 0 10 z"
                                fill="#64748b"
                            />
                        </marker>

                        {/* Marker panah yang sedang disorot */}
                        <marker
                            id={`${idUnik}-active-arrow`}
                            markerWidth="10"
                            markerHeight="10"
                            refX="8"
                            refY="5"
                            orient="auto"
                            markerUnits="userSpaceOnUse"
                        >
                            <path
                                d="M 0 0 L 10 5 L 0 10 z"
                                fill="#f59e0b"
                            />
                        </marker>

                        {/* Latar diagram */}
                        <pattern
                            id={`${idUnik}-grid`}
                            width="24"
                            height="24"
                            patternUnits="userSpaceOnUse"
                        >
                            <circle
                                cx="1"
                                cy="1"
                                r="1"
                                fill="#94a3b8"
                                opacity="0.16"
                            />
                        </pattern>
                    </defs>

                    <rect
                        x="0"
                        y="0"
                        width={LEBAR}
                        height={TINGGI}
                        fill={`url(#${idUnik}-grid)`}
                    />

                    {/* Menggambar seluruh transisi */}
                    {transisiGabungan.map((transisi) => {
                        const geometri = gambarTransisi(transisi);
                        const aktif = transisiAktif(transisi);

                        const warna = aktif ? "#f59e0b" : "#64748b";

                        return (
                            <g key={transisi.key}>
                                <path
                                    d={geometri.jalur}
                                    fill="none"
                                    stroke={warna}
                                    strokeWidth={aktif ? 4 : 2}
                                    strokeLinecap="round"
                                    markerEnd={
                                        aktif
                                            ? `url(#${idUnik}-active-arrow)`
                                            : `url(#${idUnik}-arrow)`
                                    }
                                />

                                <text
                                    x={geometri.label.x}
                                    y={geometri.label.y}
                                    textAnchor="middle"
                                    dominantBaseline="middle"
                                    fontSize="15"
                                    fontWeight="700"
                                    fill={aktif ? "#b45309" : "#334155"}
                                    stroke="#f8fafc"
                                    strokeWidth="5"
                                    strokeLinejoin="round"
                                    paintOrder="stroke"
                                >
                                    {transisi.symbols.join(", ")}
                                </text>
                            </g>
                        );
                    })}

                    {/* Menggambar panah masuk ke state awal */}
                    {dfa.states.includes(dfa.start) && (
                        <g>
                            <path
                                d={panahAwal.jalur}
                                fill="none"
                                stroke="#6366f1"
                                strokeWidth="3"
                                strokeLinecap="round"
                                markerEnd={`url(#${idUnik}-arrow)`}
                            />

                            <text
                                x={panahAwal.label.x}
                                y={panahAwal.label.y}
                                textAnchor="middle"
                                fontSize="13"
                                fontWeight="700"
                                fill="#4f46e5"
                                stroke="#f8fafc"
                                strokeWidth="4"
                                paintOrder="stroke"
                            >
                                start
                            </text>
                        </g>
                    )}

                    {/* Menggambar lingkaran state dan labelnya */}
                    {dfa.states.map((state) => {
                        const posisi = posisiState[state]!;
                        const adalahAwal = state === dfa.start;
                        const adalahAkhir = dfa.accepting.includes(state);
                        const aktif = state === activeState;

                        const warnaIsi = aktif
                            ? "#fef3c7"
                            : adalahAkhir
                                ? "#d1fae5"
                                : "#ffffff";

                        const warnaGaris = aktif
                            ? "#f59e0b"
                            : adalahAkhir
                                ? "#059669"
                                : adalahAwal
                                    ? "#6366f1"
                                    : "#64748b";

                        return (
                            <g key={state}>
                                {/* Lingkaran luar state */}
                                <circle
                                    cx={posisi.x}
                                    cy={posisi.y}
                                    r={JARI_JARI_LINGKARAN}
                                    fill={warnaIsi}
                                    stroke={warnaGaris}
                                    strokeWidth={aktif ? 4 : 2.5}
                                />

                                {/* Lingkaran kedua untuk state akhir */}
                                {adalahAkhir && (
                                    <circle
                                        cx={posisi.x}
                                        cy={posisi.y}
                                        r={JARI_JARI_LINGKARAN - 6}
                                        fill="none"
                                        stroke={warnaGaris}
                                        strokeWidth="2"
                                    />
                                )}

                                {/* Label nama state */}
                                <text
                                    x={posisi.x}
                                    y={posisi.y}
                                    textAnchor="middle"
                                    dominantBaseline="middle"
                                    fontSize="15"
                                    fontWeight="700"
                                    fill="#0f172a"
                                >
                                    {state}
                                </text>

                                {/* Keterangan state aktif */}
                                {aktif && (
                                    <text
                                        x={posisi.x}
                                        y={posisi.y + JARI_JARI_LINGKARAN + 20}
                                        textAnchor="middle"
                                        fontSize="12"
                                        fontWeight="700"
                                        fill="#b45309"
                                    >
                                        AKTIF
                                    </text>
                                )}
                            </g>
                        );
                    })}
                </svg>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
                Diagram diperbarui berdasarkan tabel transisi. Simbol
                yang mempunyai state tujuan sama digabung ke satu panah.
                Panah kuning menandai transisi terakhir yang dijalankan
                simulator.
            </p>
        </div>
    );
}
