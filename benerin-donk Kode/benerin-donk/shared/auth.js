/* Logika otentikasi (FR-10) tanpa akses DOM, sehingga dapat diuji di Node.js.
   Lapisan: validasi -> controller (prosesLogin) -> repository -> sesi. */

/* ---------- Konstanta ---------- */
const batasPanjangUsername = 50;
const batasPanjangPassword = 128;
const polaUsername = /^[A-Za-z0-9_.-]+$/;
const batasWaktuApiMs = 10000;
const jedaDemoMs = 600;

const pesanError = {
  keduaKolomKosong: "Username dan password wajib diisi.",
  usernameKosong: "Username wajib diisi.",
  passwordKosong: "Password wajib diisi.",
  usernameFormat: "Username hanya boleh berisi huruf, angka, titik, garis bawah, dan strip.",
  usernameTerlaluPanjang: `Username maksimal ${batasPanjangUsername} karakter.`,
  passwordTerlaluPanjang: `Password maksimal ${batasPanjangPassword} karakter.`,
  kredensialSalah: "Username atau password salah.",
  terlaluBanyakPercobaan: "Terlalu banyak percobaan. Coba lagi nanti.",
  kesalahanServer: "Terjadi kesalahan pada server. Coba lagi.",
  tidakTerhubung: "Tidak dapat terhubung ke server. Periksa koneksi lalu coba lagi.",
  sesiDiblokir: "Browser memblokir penyimpanan sesi. Aktifkan penyimpanan lalu coba lagi.",
};

const pesanBerdasarkanStatus = {
  401: pesanError.kredensialSalah,
  429: pesanError.terlaluBanyakPercobaan,
};

function buatPesanBlokir(sisaDetik) {
  return `Terlalu banyak percobaan. Coba lagi dalam ${sisaDetik} detik.`;
}

/* ---------- Validasi input ---------- */
function buatHasilValidasi(pesan, kolom) {
  return { valid: false, pesan, kolom };
}

function validasiKredensial(username, password) {
  if (!username && !password) {
    return buatHasilValidasi(pesanError.keduaKolomKosong, ["username", "password"]);
  }
  if (!username) return buatHasilValidasi(pesanError.usernameKosong, ["username"]);
  if (!password) return buatHasilValidasi(pesanError.passwordKosong, ["password"]);
  if (username.length > batasPanjangUsername) {
    return buatHasilValidasi(pesanError.usernameTerlaluPanjang, ["username"]);
  }
  if (!polaUsername.test(username)) {
    return buatHasilValidasi(pesanError.usernameFormat, ["username"]);
  }
  if (password.length > batasPanjangPassword) {
    return buatHasilValidasi(pesanError.passwordTerlaluPanjang, ["password"]);
  }
  return { valid: true, pesan: "", kolom: [] };
}

/* ---------- Repository kredensial ----------
   Setiap repository memiliki satu metode: cekKredensial(username, password)
   yang mengembalikan { ok: true } atau { ok: false, pesan }. */
const jeda = (ms) => new Promise((selesai) => setTimeout(selesai, ms));

function buatRepositoryDemo(akunDemo, jedaMs = jedaDemoMs) {
  return {
    async cekKredensial(username, password) {
      await jeda(jedaMs);
      const cocok = username === akunDemo.username && password === akunDemo.password;
      return cocok ? { ok: true } : { ok: false, pesan: pesanError.kredensialSalah };
    },
  };
}

function terjemahkanStatusHttp(status) {
  if (status >= 200 && status < 300) return { ok: true };
  return { ok: false, pesan: pesanBerdasarkanStatus[status] || pesanError.kesalahanServer };
}

function buatRepositoryApi(urlApi, batasWaktuMs = batasWaktuApiMs) {
  return {
    async cekKredensial(username, password) {
      const pengendali = new AbortController();
      const pewaktu = setTimeout(() => pengendali.abort(), batasWaktuMs);
      try {
        const respons = await fetch(urlApi, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin", // cookie sesi dari server ikut tersimpan
          body: JSON.stringify({ username, password }),
          signal: pengendali.signal,
        });
        return terjemahkanStatusHttp(respons.status);
      } catch {
        return { ok: false, pesan: pesanError.tidakTerhubung };
      } finally {
        clearTimeout(pewaktu);
      }
    },
  };
}

/* ---------- Controller ----------
   tahap: "validasi" (ditolak sebelum ke repository) atau "otentikasi". */
async function prosesLogin(repository, username, password) {
  const hasilValidasi = validasiKredensial(username, password);
  if (!hasilValidasi.valid) {
    return { ok: false, tahap: "validasi", pesan: hasilValidasi.pesan, kolom: hasilValidasi.kolom };
  }

  const hasilRepository = await repository.cekKredensial(username, password);
  if (hasilRepository.ok) return { ok: true };
  return { ok: false, tahap: "otentikasi", pesan: hasilRepository.pesan, kolom: ["password"] };
}

/* ---------- Pembatas percobaan ----------
   catatGagal() mengembalikan true jika batas sudah tercapai. */
function buatPembatasPercobaan(maksPercobaan) {
  let jumlahGagal = 0;
  return {
    catatGagal() {
      jumlahGagal += 1;
      return jumlahGagal >= maksPercobaan;
    },
    reset() {
      jumlahGagal = 0;
    },
  };
}

/* ---------- Sesi (penanda login di sessionStorage) ---------- */
function simpanSesi(kunciSesi, username) {
  try {
    sessionStorage.setItem(kunciSesi.login, "true");
    sessionStorage.setItem(kunciSesi.user, username);
    return true;
  } catch {
    return false;
  }
}

function hapusSesi(kunciSesi) {
  try {
    sessionStorage.removeItem(kunciSesi.login);
    sessionStorage.removeItem(kunciSesi.user);
  } catch {
    // abaikan jika penyimpanan diblokir
  }
}

function sudahLogin(kunciSesi) {
  try {
    return sessionStorage.getItem(kunciSesi.login) === "true";
  } catch {
    return false;
  }
}

function ambilNamaPengguna(kunciSesi) {
  try {
    return sessionStorage.getItem(kunciSesi.user) || "";
  } catch {
    return "";
  }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    pesanError,
    buatPesanBlokir,
    validasiKredensial,
    buatRepositoryDemo,
    buatRepositoryApi,
    terjemahkanStatusHttp,
    prosesLogin,
    buatPembatasPercobaan,
  };
}
