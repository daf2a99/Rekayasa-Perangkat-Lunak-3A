/* ══════════════════════════════════════════════
   dashboard.js — halaman form lapor kerusakan
   ══════════════════════════════════════════════ */

/* ── AMBIL ELEMEN-ELEMEN HTML ── */
// ini untuk mengambil semua elemen yang dipakai, supaya tinggal dipanggil lewat nama
const form = document.getElementById("form-laporan");
const selKategori = document.getElementById("kategori"); // dropdown kelompok (Perabot, Sanitasi, ...)
const selBarang = document.getElementById("barang"); // dropdown nama barang (ini yang dikirim: id_kategori)
const selLantai = document.getElementById("lantai"); // dropdown lantai
const selRuang = document.getElementById("ruang"); // dropdown ruang (ini yang dikirim: id_lokasi)
const inputFoto = document.getElementById("foto");
const daftarFile = document.getElementById("file-list");
const pesanError = document.getElementById("form-error");
const tombolKirim = document.getElementById("kirim-btn");
const panelForm = document.getElementById("panel-form");
const panelSukses = document.getElementById("panel-sukses");

/* ── ATURAN FOTO (harus sama dengan aturan di server.js) ── */
// ini untuk batas foto: maksimal 3 file, 5 MB per file, hanya JPG/PNG
const MAKS_FOTO = 3;
const MAKS_UKURAN_MB = 5;
const TIPE_BOLEH = ["image/jpeg", "image/png"];

/* ── SET TAHUN FOOTER DINAMIS ── */
// ini untuk mengisi tahun di footer otomatis
document.getElementById("year").textContent = new Date().getFullYear();

/* ── LOGIKA TEMA TERANG/GELAP ── */
const themeBtn = document.getElementById("theme-btn");

// ini untuk mengambil pilihan tema terakhir (kalau ada), default terang
let isLight = true;
try {
  isLight = localStorage.getItem("theme") !== "dark";
} catch (e) {
  // localStorage tidak tersedia, pakai default terang
}

// ini untuk memasang tema: mengganti class di <body> dan menyimpan pilihannya
function applyTheme() {
  document.body.className = isLight ? "light" : "dark";
  themeBtn.setAttribute("aria-pressed", String(!isLight));
  try {
    localStorage.setItem("theme", isLight ? "light" : "dark");
  } catch (e) {
    // abaikan jika penyimpanan diblokir
  }
}

applyTheme();

// ini untuk tombol bulan/matahari: tiap diklik, tema dibalik
themeBtn.addEventListener("click", () => {
  isLight = !isLight;
  applyTheme();
});

/* ── PESAN ERROR ── */
// ini untuk menampilkan pesan error merah di atas tombol
function tampilkanError(teks) {
  pesanError.textContent = teks;
  pesanError.hidden = false;
}

// ini untuk menyembunyikan pesan error
function sembunyikanError() {
  pesanError.textContent = "";
  pesanError.hidden = true;
}

/* ── MUAT DATA DROPDOWN DARI SERVER ── */
let dataKategori = []; // isi: [{ id_kategori, kelompok, nama_kategori }, ...]
let dataLokasi = []; // isi: [{ id_lokasi, lantai, ruang }, ...]

// ini untuk meminta data ke server (GET) dan mengubahnya jadi array
async function ambilData(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Gagal memuat " + url);
  return res.json();
}

// ini untuk menambah satu <option> ke sebuah dropdown
function tambahOpsi(select, value, teks) {
  const opt = document.createElement("option");
  opt.value = value;
  opt.textContent = teks;
  select.appendChild(opt);
}

// ini untuk mengosongkan dropdown lalu mengisi opsi pertama (teks petunjuk)
function kosongkan(select, teksPetunjuk, kunci) {
  select.innerHTML = "";
  tambahOpsi(select, "", teksPetunjuk);
  select.disabled = kunci; // true = terkunci, tidak bisa dipilih
}

// ini untuk mengisi dropdown kategori (hanya nama kelompok, tanpa duplikat)
function isiKategori() {
  const kelompok = [...new Set(dataKategori.map((k) => k.kelompok))];
  kelompok.forEach((nama) => tambahOpsi(selKategori, nama, nama));
}

// ini untuk mengisi dropdown lantai (angka lantai, tanpa duplikat, urut kecil ke besar)
function isiLantai() {
  const lantai = [...new Set(dataLokasi.map((l) => l.lantai))].sort((a, b) => a - b);
  lantai.forEach((n) => tambahOpsi(selLantai, n, "Lantai " + n));
}

// ini untuk memuat kedua data sekaligus saat halaman dibuka
async function muatDropdown() {
  try {
    [dataKategori, dataLokasi] = await Promise.all([
      ambilData("/api/kategori"),
      ambilData("/api/lokasi"),
    ]);
    isiKategori();
    isiLantai();
  } catch (err) {
    tampilkanError("Data kategori dan lokasi gagal dimuat. Coba muat ulang halaman.");
  }
}

/* ── DROPDOWN BERTINGKAT ── */
// ini untuk: begitu kategori dipilih, dropdown Nama Barang hanya berisi barang di kategori itu
selKategori.addEventListener("change", () => {
  kosongkan(selBarang, "Pilih Barang", false);
  const barang = dataKategori.filter((k) => k.kelompok === selKategori.value);
  barang.forEach((b) => tambahOpsi(selBarang, b.id_kategori, b.nama_kategori));
  if (!selKategori.value) kosongkan(selBarang, "Pilih kategori dulu", true);
});

// ini untuk: begitu lantai dipilih, dropdown Ruang hanya berisi ruang di lantai itu
selLantai.addEventListener("change", () => {
  kosongkan(selRuang, "Pilih Ruang", false);
  const ruang = dataLokasi.filter((l) => String(l.lantai) === selLantai.value);
  ruang.forEach((r) => tambahOpsi(selRuang, r.id_lokasi, r.ruang));
  if (!selLantai.value) kosongkan(selRuang, "Pilih lantai dulu", true);
});

/* ── UPLOAD FOTO ── */
// ini untuk menampilkan nama file yang dipilih di bawah kotak upload
function tampilkanDaftarFile(files) {
  daftarFile.innerHTML = "";
  files.forEach((f) => {
    const li = document.createElement("li");
    li.textContent = f.name + " (" + (f.size / 1024 / 1024).toFixed(1) + " MB)";
    daftarFile.appendChild(li);
  });
  daftarFile.hidden = files.length === 0;
}

// ini untuk memeriksa foto begitu dipilih: jumlah, tipe, dan ukuran. Kalau salah, pilihan dibatalkan
inputFoto.addEventListener("change", () => {
  sembunyikanError();
  const files = Array.from(inputFoto.files);

  let masalah = "";
  if (files.length > MAKS_FOTO) {
    masalah = "Maksimal " + MAKS_FOTO + " foto.";
  } else if (files.some((f) => !TIPE_BOLEH.includes(f.type))) {
    masalah = "Foto harus berformat JPG atau PNG.";
  } else if (files.some((f) => f.size > MAKS_UKURAN_MB * 1024 * 1024)) {
    masalah = "Ukuran tiap foto maksimal " + MAKS_UKURAN_MB + " MB.";
  }

  if (masalah) {
    inputFoto.value = ""; // batalkan pilihan
    tampilkanDaftarFile([]);
    tampilkanError(masalah);
    return;
  }
  tampilkanDaftarFile(files);
});

/* ── TOMBOL RESET ── */
// ini untuk: setelah form direset, kunci lagi dropdown bertingkat dan kosongkan daftar foto
form.addEventListener("reset", () => {
  kosongkan(selBarang, "Pilih kategori dulu", true);
  kosongkan(selRuang, "Pilih lantai dulu", true);
  tampilkanDaftarFile([]);
  sembunyikanError();
});

/* ── KIRIM LAPORAN ── */
// ini untuk mengirim form ke server tanpa pindah halaman (fetch + FormData)
form.addEventListener("submit", async (e) => {
  e.preventDefault(); // cegah browser kirim form dengan cara biasa (halaman reload)
  sembunyikanError();

  // ini untuk memeriksa aturan di HTML (required, minlength, dll). Kalau ada yang salah, browser menandai isiannya
  if (!form.reportValidity()) return;

  // ini untuk mengunci tombol selama mengirim, supaya tidak terkirim dua kali
  tombolKirim.disabled = true;
  tombolKirim.textContent = "Mengirim...";

  try {
    // FormData otomatis mengambil semua isian yang punya name, termasuk foto.
    // Jangan atur Content-Type sendiri, biar browser yang mengaturnya.
    const res = await fetch("/api/laporan", { method: "POST", body: new FormData(form) });
    const hasil = await res.json().catch(() => ({}));

    if (!res.ok) {
      // server menolak (data kurang/salah): tampilkan pesannya
      tampilkanError(hasil.pesan || "Gagal mengirim laporan. Coba lagi.");
      return;
    }

    // berhasil: tampilkan panel sukses beserta kode laporannya
    document.getElementById("kode-unik").textContent = hasil.kode_unik;
    panelForm.hidden = true;
    panelSukses.hidden = false;
    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch (err) {
    // gagal sampai ke server (server mati / internet putus)
    tampilkanError("Tidak bisa terhubung ke server. Pastikan server sedang jalan.");
  } finally {
    // apapun hasilnya, tombol dikembalikan seperti semula
    tombolKirim.disabled = false;
    tombolKirim.textContent = "Kirim Laporan";
  }
});

/* ── PANEL SUKSES ── */
const tombolSalin = document.getElementById("salin-btn");

// ini untuk menyalin kode laporan ke clipboard
tombolSalin.addEventListener("click", async () => {
  const kode = document.getElementById("kode-unik").textContent;
  try {
    await navigator.clipboard.writeText(kode);
    tombolSalin.textContent = "Tersalin!";
  } catch (err) {
    tombolSalin.textContent = "Salin manual ya";
  }
  setTimeout(() => (tombolSalin.textContent = "Salin Kode"), 2000);
});

// ini untuk tombol "Lapor Lagi": kosongkan form lalu tampilkan form lagi
document.getElementById("lapor-lagi-btn").addEventListener("click", () => {
  form.reset();
  panelSukses.hidden = true;
  panelForm.hidden = false;
});

/* ── JALANKAN SAAT HALAMAN DIBUKA ── */
// ini untuk memulai: isi dropdown kategori dan lantai dari server
muatDropdown();
