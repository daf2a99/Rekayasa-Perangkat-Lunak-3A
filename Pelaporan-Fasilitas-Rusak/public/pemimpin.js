// Halaman tujuan setelah login berhasil (placeholder, ganti saat halamannya sudah ada)
const HALAMAN_TUJUAN = "example.html";

// MODE_DEMO = true  -> login dicek di browser memakai AKUN_DEMO di bawah (hanya untuk uji tampilan)
// MODE_DEMO = false -> login dikirim ke backend lewat API_LOGIN_URL
// PENTING: ubah ke false dan hapus AKUN_DEMO sebelum website dipakai sungguhan,
// karena kode JavaScript bisa dibaca siapa saja yang membuka website.
const MODE_DEMO = true;
const AKUN_DEMO = { username: "admin", password: "admin123" };

// Alamat endpoint backend untuk memeriksa login (isi saat backend sudah ada)
const API_LOGIN_URL = "/api/admin/login";

// Batas percobaan salah sebelum tombol dikunci sementara.
// Ini hanya pengaman tampilan; pembatasan yang sebenarnya harus ada di backend.
const MAKS_PERCOBAAN = 5;
const DURASI_BLOKIR_DETIK = 30;

/*ELEMEN HALAMAN*/
const form = document.getElementById("login-form");
const inputUser = document.getElementById("login-user");
const inputPass = document.getElementById("login-pass");
const tombolLogin = document.getElementById("login-btn");
const kotakError = document.getElementById("login-error");
const tombolMata = document.getElementById("toggle-pass");
const themeBtn = document.getElementById("theme-btn");

/*FOOTER: tahun otomatis*/
document.getElementById("year").textContent = new Date().getFullYear();


   //TEMA TERANG/GELAP

let isLight = true;
try {
  isLight = localStorage.getItem("theme") !== "dark";
} catch (e) {
  // localStorage tidak tersedia (mode privat, dll): pakai tema terang
}

function terapkanTema() {
  document.body.className = isLight ? "light" : "dark";
  themeBtn.setAttribute("aria-pressed", String(!isLight));
  try {
    localStorage.setItem("theme", isLight ? "light" : "dark");
  } catch (e) {
    // abaikan jika penyimpanan diblokir
  }
}

terapkanTema();

themeBtn.addEventListener("click", () => {
  isLight = !isLight;
  terapkanTema();
});

/*TAMPIL/SEMBUNYIKAN PASSWORD (tombol mata)*/
tombolMata.addEventListener("click", () => {
  const sedangTersembunyi = inputPass.type === "password";
  inputPass.type = sedangTersembunyi ? "text" : "password";

  // aria-pressed dipakai CSS untuk menukar ikon mata, dan oleh pembaca layar
  tombolMata.setAttribute("aria-pressed", String(sedangTersembunyi));
  tombolMata.setAttribute(
    "aria-label",
    sedangTersembunyi ? "Sembunyikan password" : "Tampilkan password",
  );
  inputPass.focus();
});

/*PESAN ERROR*/
function tampilkanError(pesan, ...kolomBermasalah) {
  kotakError.textContent = pesan;
  kotakError.hidden = false;
  // Beri tanda merah pada kolom yang bermasalah
  [inputUser, inputPass].forEach((k) =>
    k.classList.toggle("invalid", kolomBermasalah.includes(k)),
  );
}

function bersihkanError() {
  kotakError.hidden = true;
  kotakError.textContent = "";
  inputUser.classList.remove("invalid");
  inputPass.classList.remove("invalid");
}

// Pesan error hilang begitu pengguna mulai mengetik lagi
inputUser.addEventListener("input", bersihkanError);
inputPass.addEventListener("input", bersihkanError);

/* PEMERIKSAAN LOGIN
   Mengembalikan { ok: true } jika berhasil,
   atau { ok: false, pesan: "..." } jika gagal.
   Bagian ini satu-satunya yang perlu diganti saat backend siap.*/
const jeda = (ms) => new Promise((selesai) => setTimeout(selesai, ms));

async function periksaLogin(username, password) {
  // Mode demo: cocokkan dengan akun contoh (jeda kecil meniru waktu tunggu server)
  if (MODE_DEMO) {
    await jeda(600);
    const cocok =
      username === AKUN_DEMO.username && password === AKUN_DEMO.password;
    return cocok
      ? { ok: true }
      : { ok: false, pesan: "Username atau password salah." };
  }

  // Mode backend: kirim username dan password ke server
  try {
    const respons = await fetch(API_LOGIN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin", // cookie sesi dari server ikut tersimpan
      body: JSON.stringify({ username, password }),
    });

    if (respons.ok) return { ok: true };
    if (respons.status === 401) {
      return { ok: false, pesan: "Username atau password salah." };
    }
    if (respons.status === 429) {
      return { ok: false, pesan: "Terlalu banyak percobaan. Coba lagi nanti." };
    }
    return { ok: false, pesan: "Terjadi kesalahan pada server. Coba lagi." };
  } catch (e) {
    // fetch gagal total: server mati atau tidak ada koneksi
    return { ok: false, pesan: "Tidak dapat terhubung ke server. Periksa koneksi lalu coba lagi." };
  }
}

/* BATAS PERCOBAAN (pengaman tampilan)
   Setelah MAKS_PERCOBAAN kali salah, tombol dikunci sementara
   dengan hitung mundur. Catatan: hilang jika halaman dimuat ulang,
   jadi backend tetap harus membatasi percobaan login.*/
let jumlahGagal = 0;
let sedangDiblokir = false;

function blokirSementara() {
  sedangDiblokir = true;
  tombolLogin.disabled = true;
  let sisa = DURASI_BLOKIR_DETIK;

  const hitungMundur = setInterval(() => {
    sisa -= 1;
    if (sisa <= 0) {
      clearInterval(hitungMundur);
      sedangDiblokir = false;
      jumlahGagal = 0;
      tombolLogin.disabled = false;
      tombolLogin.textContent = "Masuk";
      bersihkanError();
      return;
    }
    tampilkanError(`Terlalu banyak percobaan. Coba lagi dalam ${sisa} detik.`);
  }, 1000);

  tampilkanError(`Terlalu banyak percobaan. Coba lagi dalam ${sisa} detik.`);
}

/*PROSES KIRIM FORM LOGIN*/
form.addEventListener("submit", async (event) => {
  event.preventDefault(); // cegah halaman memuat ulang
  if (sedangDiblokir) return;

  const username = inputUser.value.trim();
  const password = inputPass.value; // password tidak di-trim, spasi bisa jadi bagian password

  // 1. Validasi: kolom tidak boleh kosong
  if (!username && !password) {
    tampilkanError("Username dan password wajib diisi.", inputUser, inputPass);
    inputUser.focus();
    return;
  }
  if (!username) {
    tampilkanError("Username wajib diisi.", inputUser);
    inputUser.focus();
    return;
  }
  if (!password) {
    tampilkanError("Password wajib diisi.", inputPass);
    inputPass.focus();
    return;
  }

  // 2. Kunci tombol selama pemeriksaan agar tidak terkirim dua kali
  bersihkanError();
  tombolLogin.disabled = true;
  tombolLogin.textContent = "Memeriksa...";

  const hasil = await periksaLogin(username, password);

  // 3a. Berhasil: tandai login lalu pindah ke halaman tujuan
  if (hasil.ok) {
    try {
      // Penanda sementara untuk mode demo. Saat memakai backend, status login
      // disimpan server lewat cookie sesi, dan halaman tujuan wajib memeriksanya di server.
      sessionStorage.setItem("adminLogin", "true");
    } catch (e) {
      // abaikan jika penyimpanan diblokir
    }
    window.location.href = HALAMAN_TUJUAN;
    return;
  }

  // 3b. Gagal: tampilkan pesan, hitung percobaan, kosongkan password
  jumlahGagal += 1;
  tombolLogin.disabled = false;
  tombolLogin.textContent = "Masuk";
  inputPass.value = "";

  if (jumlahGagal >= MAKS_PERCOBAAN) {
    blokirSementara();
    return;
  }

  tampilkanError(hasil.pesan, inputPass);
  inputPass.focus();
});


