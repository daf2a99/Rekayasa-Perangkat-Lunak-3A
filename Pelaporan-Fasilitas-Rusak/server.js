require("dotenv").config();
const express = require("express");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const multer = require("multer");
const sharp = require("sharp");
const pool = require("./db");

const app = express();

// Hanya isi folder public/ yang bisa dibuka dari browser
app.use(express.static(path.join(__dirname, "public")));

// Folder penyimpanan foto bukti (di luar public/)
const FOLDER_UPLOAD = path.join(__dirname, "uploads");
fs.mkdirSync(FOLDER_UPLOAD, { recursive: true });

// Multer: terima foto di memori dulu. Maks 3 foto @5 MB, hanya JPG/PNG
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 3 },
  fileFilter: (req, file, cb) =>
    ["image/jpeg", "image/png"].includes(file.mimetype)
      ? cb(null, true)
      : cb(new Error("FORMAT_FOTO")),
});

// Kolom wajib: name di form -> label yang tampil ke pelapor
const WAJIB = {
  nama: "Nama Lengkap",
  nip_nim: "NIM/NIP",
  no_wa: "Nomor WhatsApp",
  id_kategori: "Nama Barang",
  id_lokasi: "Ruang",
  deskripsi: "Deskripsi Kerusakan",
};

/* ── 1. Daftar kategori untuk dropdown ── */
app.get("/api/kategori", async (req, res) => {
  try {
    const [baris] = await pool.execute(
      `SELECT id_kategori, kelompok, nama_kategori
       FROM kategori_fasilitas
       ORDER BY (kelompok = 'Lainnya'), kelompok, nama_kategori`);
    res.json(baris);
  } catch (err) {
    console.error(err);
    res.status(500).json({ pesan: "Gagal memuat kategori." });
  }
});

/* ── 2. Daftar lokasi untuk dropdown ── */
app.get("/api/lokasi", async (req, res) => {
  try {
    const [baris] = await pool.execute(
      `SELECT id_lokasi, lantai, ruang
       FROM ruangan
       ORDER BY lantai, (ruang = 'Lainnya'), ruang`);
    res.json(baris);
  } catch (err) {
    console.error(err);
    res.status(500).json({ pesan: "Gagal memuat lokasi." });
  }
});

/* ── 3. Simpan laporan baru ── */
app.post("/api/laporan", (req, res) => {
  upload.array("foto", 3)(req, res, async (errUpload) => {
    // Error dari multer: format salah, terlalu besar, terlalu banyak
    if (errUpload) {
      const pesan =
        errUpload.message === "FORMAT_FOTO"
          ? "Foto harus berformat JPG atau PNG."
          : "Foto terlalu besar (maks 5 MB) atau lebih dari 3 file.";
      return res.status(400).json({ pesan });
    }

    const foto = req.files || [];

    // a. Cek kolom yang kosong, lalu sebutkan satu per satu
    const kurang = Object.keys(WAJIB)
      .filter((k) => !req.body[k] || !String(req.body[k]).trim())
      .map((k) => WAJIB[k]);
    if (foto.length === 0) kurang.push("Foto Bukti");

    if (kurang.length > 0) {
      console.log("DATA DITERIMA:", req.body); // bantu debugging, lihat di terminal
      return res.status(400).json({ pesan: "Data belum lengkap: " + kurang.join(", ") + "." });
    }

    // b. Rapikan isian (name di form: nip_nim dan no_wa)
    const nama = req.body.nama.trim();
    const nip_nim = req.body.nip_nim.trim();
    const deskripsi = req.body.deskripsi.trim();
    const { id_kategori, id_lokasi } = req.body;
    const wa = req.body.no_wa.replace(/[\s-]/g, "");

    // c. Cek format dan panjang
    if (nama.length < 3 || nama.length > 100) {
      return res.status(400).json({ pesan: "Nama harus 3-100 karakter." });
    }
    if (nip_nim.length < 5 || nip_nim.length > 30) {
      return res.status(400).json({ pesan: "NIM/NIP harus 5-30 karakter." });
    }
    if (!/^(\+62|62|0)8\d{8,12}$/.test(wa)) {
      return res.status(400).json({ pesan: "Format nomor WhatsApp tidak sesuai." });
    }
    if (deskripsi.length < 10 || deskripsi.length > 1000) {
      return res.status(400).json({ pesan: "Deskripsi harus 10-1000 karakter." });
    }

    // d. Kompres foto lalu simpan ke folder uploads
    const tersimpan = [];
    const hapusFile = () =>
      tersimpan.forEach((t) => fs.unlink(path.join(__dirname, t.path), () => {}));
    try {
      for (const f of foto) {
        const namaFile = crypto.randomUUID() + ".jpg";
        const info = await sharp(f.buffer)
          .rotate()                                          // luruskan orientasi dari HP
          .resize({ width: 1280, withoutEnlargement: true }) // maks lebar 1280 px
          .jpeg({ quality: 80 })
          .toFile(path.join(FOLDER_UPLOAD, namaFile));
        tersimpan.push({ path: "uploads/" + namaFile, kb: Math.ceil(info.size / 1024) });
      }
    } catch (e) {
      hapusFile();
      return res.status(400).json({ pesan: "File foto tidak bisa dibaca." });
    }

    // e. Simpan ke database dalam satu transaksi (berhasil semua atau batal semua)
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // pelapor: pakai yang sudah ada (cek NIM/NIP) atau buat baru
      // (nama kolom di database: nip_nim dan no_wa)
      const [cari] = await conn.execute(
        "SELECT id_pelapor FROM pelapor WHERE nip_nim = ?", [nip_nim]);
      let idPelapor;
      if (cari.length) {
        idPelapor = cari[0].id_pelapor;
        await conn.execute(
          "UPDATE pelapor SET nama = ?, no_wa = ? WHERE id_pelapor = ?",
          [nama, wa, idPelapor]);
      } else {
        const [baru] = await conn.execute(
          "INSERT INTO pelapor (nama, nip_nim, no_wa) VALUES (?, ?, ?)",
          [nama, nip_nim, wa]);
        idPelapor = baru.insertId;
      }

      // laporan
      const [lap] = await conn.execute(
        `INSERT INTO laporan (id_pelapor, id_kategori, id_lokasi, deskripsi)
         VALUES (?, ?, ?, ?)`,
        [idPelapor, id_kategori, id_lokasi, deskripsi]);
      const idLaporan = lap.insertId;

      // kode unik dari id, contoh: FST-R-001
      const kode = "FST-R-" + String(idLaporan).padStart(3, "0");
      await conn.execute(
        "UPDATE laporan SET kode_unik = ? WHERE id_laporan = ?", [kode, idLaporan]);

      // foto
      for (const t of tersimpan) {
        await conn.execute(
          "INSERT INTO foto_laporan (id_laporan, path_file, ukuran_kb) VALUES (?, ?, ?)",
          [idLaporan, t.path, t.kb]);
      }

      // riwayat status pertama
      await conn.execute(
        "INSERT INTO riwayat_status (id_laporan, status) VALUES (?, 'Laporan Diterima')",
        [idLaporan]);

      await conn.commit();
      res.status(201).json({ kode_unik: kode });
    } catch (err) {
      await conn.rollback();
      hapusFile();
      console.error(err);
      if (err.code === "ER_NO_REFERENCED_ROW_2") {
        return res.status(400).json({ pesan: "Kategori atau lokasi tidak valid." });
      }
      res.status(500).json({ pesan: "Gagal menyimpan laporan." });
    } finally {
      conn.release();
    }
  });
});

/* ── Jalankan server + cek koneksi MySQL ── */
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`Server jalan di http://localhost:${PORT}`);
  try {
    await pool.query("SELECT 1");
    console.log("Terhubung ke MySQL.");
  } catch (err) {
    console.error("GAGAL terhubung ke MySQL:", err.message);
  }
});
