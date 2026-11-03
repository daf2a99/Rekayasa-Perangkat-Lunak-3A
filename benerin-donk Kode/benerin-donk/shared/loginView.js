/* Antarmuka halaman login: hanya mengurus DOM. Keputusan otentikasi ada di auth.js. */
const maksPercobaanBawaan = 5;
const durasiBlokirDetikBawaan = 30;

function ambilElemenLogin() {
  const ambil = (id) => document.getElementById(id);
  return {
    form: ambil("login-form"),
    inputUser: ambil("login-user"),
    inputPass: ambil("login-pass"),
    tombolLogin: ambil("login-btn"),
    kotakError: ambil("login-error"),
    tombolMata: ambil("toggle-pass"),
  };
}

function tampilkanError(elemen, pesan, kolomBermasalah = []) {
  elemen.kotakError.textContent = pesan;
  elemen.kotakError.hidden = false;
  elemen.inputUser.classList.toggle("invalid", kolomBermasalah.includes("username"));
  elemen.inputPass.classList.toggle("invalid", kolomBermasalah.includes("password"));
}

function bersihkanError(elemen) {
  elemen.kotakError.hidden = true;
  elemen.kotakError.textContent = "";
  elemen.inputUser.classList.remove("invalid");
  elemen.inputPass.classList.remove("invalid");
}

function aturTombolLogin(elemen, terkunci, teks) {
  elemen.tombolLogin.disabled = terkunci;
  elemen.tombolLogin.textContent = teks;
}

function pasangTombolMata(elemen) {
  elemen.tombolMata.addEventListener("click", () => {
    const sedangTersembunyi = elemen.inputPass.type === "password";
    elemen.inputPass.type = sedangTersembunyi ? "text" : "password";
    elemen.tombolMata.setAttribute("aria-pressed", String(sedangTersembunyi));
    elemen.tombolMata.setAttribute(
      "aria-label",
      sedangTersembunyi ? "Sembunyikan password" : "Tampilkan password",
    );
    elemen.inputPass.focus();
  });
}

function jalankanBlokir(elemen, status, pembatas, durasiDetik) {
  status.sedangDiblokir = true;
  elemen.tombolLogin.disabled = true;
  let sisaDetik = durasiDetik;
  tampilkanError(elemen, buatPesanBlokir(sisaDetik));

  const pewaktu = setInterval(() => {
    sisaDetik -= 1;
    if (sisaDetik <= 0) {
      clearInterval(pewaktu);
      status.sedangDiblokir = false;
      pembatas.reset();
      aturTombolLogin(elemen, false, "Masuk");
      bersihkanError(elemen);
      return;
    }
    tampilkanError(elemen, buatPesanBlokir(sisaDetik));
  }, 1000);
}

function tanganiLoginBerhasil(elemen, konfigurasi, username) {
  if (!simpanSesi(konfigurasi.kunciSesi, username)) {
    aturTombolLogin(elemen, false, "Masuk");
    tampilkanError(elemen, pesanError.sesiDiblokir);
    return;
  }
  window.location.href = konfigurasi.halamanTujuan;
}

function tanganiLoginGagal(elemen, hasil, pembatas, status, durasiBlokirDetik) {
  aturTombolLogin(elemen, false, "Masuk");

  if (hasil.tahap === "otentikasi") {
    elemen.inputPass.value = "";
    if (pembatas.catatGagal()) {
      jalankanBlokir(elemen, status, pembatas, durasiBlokirDetik);
      return;
    }
  }

  tampilkanError(elemen, hasil.pesan, hasil.kolom);
  const kolomPertama = hasil.kolom[0] === "username" ? elemen.inputUser : elemen.inputPass;
  kolomPertama.focus();
}

async function tanganiSubmit(event, elemen, konfigurasi, pembatas, status) {
  event.preventDefault();
  if (status.sedangDiblokir) return;

  const username = elemen.inputUser.value.trim();
  const password = elemen.inputPass.value; // tidak di-trim: spasi dapat menjadi bagian password

  bersihkanError(elemen);
  aturTombolLogin(elemen, true, "Memeriksa...");
  const hasil = await prosesLogin(konfigurasi.repository, username, password);

  if (hasil.ok) {
    tanganiLoginBerhasil(elemen, konfigurasi, username);
    return;
  }
  tanganiLoginGagal(elemen, hasil, pembatas, status, konfigurasi.durasiBlokirDetik ?? durasiBlokirDetikBawaan);
}

function inisialisasiHalamanLogin(konfigurasi) {
  const elemen = ambilElemenLogin();
  const pembatas = buatPembatasPercobaan(konfigurasi.maksPercobaan ?? maksPercobaanBawaan);
  const status = { sedangDiblokir: false };

  pasangTombolMata(elemen);
  elemen.inputUser.addEventListener("input", () => bersihkanError(elemen));
  elemen.inputPass.addEventListener("input", () => bersihkanError(elemen));
  elemen.form.addEventListener("submit", (event) =>
    tanganiSubmit(event, elemen, konfigurasi, pembatas, status),
  );
}
