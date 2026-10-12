
/**
 * Otomata Lab — Pengujian komponen UI.
 *
 * Skenario:
 * 1. Beranda dan navigasi antarlevel.
 * 2. Pergantian tema terang dan gelap.
 * 3. Event dan reset simulasi pintu otomatis.
 * 4. Pengujian massal string menggunakan TestRunner.
 */

import {
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";

import userEvent from "@testing-library/user-event";

/**
 * Mock ikon Lucide agar pengujian tidak bergantung pada
 * implementasi internal ikon yang bersifat dekoratif.
 */
vi.mock("lucide-react", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("lucide-react")>();

  return {
    ...actual,
    Sun: () => null,
    Moon: () => null,
  };
});

import App from "../src/App";
import ThemeToggle from "../src/components/ThemeToggle";
import AutomaticDoorStudy from "../src/components/AutomaticDoorStudy";
import TestRunner from "../src/components/TestRunner";
import { endsWithOneDFA } from "../src/core/presets";

describe("Otomata Lab — Pengujian UI", () => {
  /**
   * Tes 1:
   * Beranda ditampilkan dan navigasi Level 1 berfungsi.
   */
  it("menampilkan beranda dan dapat membuka Level 1", async () => {
    const user = userEvent.setup();

    render(<App />);

    expect(
      screen.getByRole("heading", {
        name: /jelajahi dunia/i,
      }),
    ).toBeInTheDocument();

    // Batasi pencarian tombol pada navigasi utama.
    const navigasi = screen.getByRole("navigation", {
      name: /navigasi utama/i,
    });

    const tombolLevel1 = within(navigasi).getByRole("button", {
      name: /level 1/i,
    });

    await user.click(tombolLevel1);

    expect(
      screen.getAllByRole("heading", {
        name: /alfabet dan string/i,
      }).length,
    ).toBeGreaterThan(0);

    expect(tombolLevel1).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  /**
   * Tes 2:
   * Tema berubah dan preferensi tersimpan di localStorage.
   */
  it("mengganti tema dan menyimpan preferensi pengguna", async () => {
    const user = userEvent.setup();

    render(<ThemeToggle />);

    const tombolTemaGelap = screen.getByRole("button", {
      name: /aktifkan mode gelap/i,
    });

    expect(tombolTemaGelap).toHaveAttribute(
      "aria-pressed",
      "false",
    );

    await user.click(tombolTemaGelap);

    const tombolTemaTerang = screen.getByRole("button", {
      name: /aktifkan mode terang/i,
    });

    expect(tombolTemaTerang).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    expect(document.documentElement).toHaveClass("dark");

    expect(
      window.localStorage.getItem("otomata-lab-theme"),
    ).toBe("dark");
  });

  /**
   * Tes 3:
   * Event sensor mengubah state pintu dan menambah riwayat.
   */
  it("menjalankan simulasi pintu otomatis", async () => {
    const user = userEvent.setup();

    render(<AutomaticDoorStudy />);

    // Nama aksesibel tombol memuat deskripsi sensor setelah
    // teks "Ada orang". Awalan ini membedakannya dari tombol lain.
    await user.click(
      screen.getByRole("button", {
        name: /^Ada orang/i,
      }),
    );

    expect(
      screen.getByText(/pintu bergerak ke posisi terbuka/i),
    ).toBeInTheDocument();

    expect(
      screen.getByText("1 event"),
    ).toBeInTheDocument();

    // Berikutnya, sensor tidak mendeteksi orang.
    await user.click(
      screen.getByRole("button", {
        name: /^Tidak ada orang/i,
      }),
    );

    expect(
      screen.getByText(/pintu bergerak ke posisi tertutup/i),
    ).toBeInTheDocument();

    expect(
      screen.getByText("2 event"),
    ).toBeInTheDocument();
  });

  /**
   * Tes 4:
   * Reset mengembalikan simulasi dan menghapus riwayat.
   */
  it("mereset simulasi pintu dan menghapus riwayat", async () => {
    const user = userEvent.setup();

    render(<AutomaticDoorStudy />);

    await user.click(
      screen.getByRole("button", {
        name: /^Ada orang/i,
      }),
    );

    expect(
      screen.getByText("1 event"),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", {
        name: /reset simulasi/i,
      }),
    );

    expect(
      screen.getByText(/simulasi direset/i),
    ).toBeInTheDocument();

    expect(
      screen.getByText("0 event"),
    ).toBeInTheDocument();
  });

  /**
   * Tes 5:
   * TestRunner membandingkan hasil aktual dengan harapan.
   *
   * DFA Ends With One menerima string yang berakhir dengan 1.
   */
  it("menguji beberapa string dan menampilkan hasil yang cocok", async () => {
    const user = userEvent.setup();

    render(
      <TestRunner
        dfa={endsWithOneDFA}
        disabled={false}
      />,
    );

    const kolomInput = screen.getByLabelText(
      "Input pengujian",
    );

    fireEvent.change(kolomInput, {
      target: {
        value: [
          "1 ✓",
          "0 ✗",
          "ε ✗",
        ].join("\n"),
      },
    });

    await user.click(
      screen.getByRole("button", {
        name: /jalankan semua tes/i,
      }),
    );

    expect(
      screen.getByRole("heading", {
        name: /hasil pengujian/i,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(/3 dari 3 kasus uji cocok/i),
    ).toBeInTheDocument();

    expect(
      screen.getAllByText(/cocok/i).length,
    ).toBeGreaterThan(0);
  });

  /**
   * Tes 6:
   * Kasus dengan harapan yang salah harus ditandai tidak cocok.
   */
  it("menandai kasus yang hasilnya tidak sesuai harapan", async () => {
    const user = userEvent.setup();

    render(
      <TestRunner
        dfa={endsWithOneDFA}
        disabled={false}
      />,
    );

    fireEvent.change(
      screen.getByLabelText("Input pengujian"),
      {
        target: {
          // String "1" diterima DFA, tetapi harapannya ditolak.
          value: "1 ✗",
        },
      },
    );

    await user.click(
      screen.getByRole("button", {
        name: /jalankan semua tes/i,
      }),
    );

    expect(
      screen.getByText(/0 dari 1 kasus uji cocok/i),
    ).toBeInTheDocument();

    expect(
      screen.getByText(/1 kasus membutuhkan pemeriksaan/i),
    ).toBeInTheDocument();
  });
});
