/* Tema terang/gelap dan tahun footer. Dipakai semua halaman. */
const kunciPenyimpananTema = "theme";

function bacaTemaTerang() {
  try {
    return localStorage.getItem(kunciPenyimpananTema) !== "dark";
  } catch {
    return true; // penyimpanan diblokir: pakai tema terang
  }
}

function simpanTema(temaTerang) {
  try {
    localStorage.setItem(kunciPenyimpananTema, temaTerang ? "light" : "dark");
  } catch {
    // abaikan jika penyimpanan diblokir
  }
}

function terapkanTema(temaTerang, tombolTema) {
  document.body.className = temaTerang ? "light" : "dark";
  tombolTema.setAttribute("aria-pressed", String(!temaTerang));
  simpanTema(temaTerang);
}

function isiTahunFooter() {
  const elemenTahun = document.getElementById("year");
  if (elemenTahun) elemenTahun.textContent = new Date().getFullYear();
}

function inisialisasiTema() {
  isiTahunFooter();
  const tombolTema = document.getElementById("theme-btn");
  if (!tombolTema) return;

  let temaTerang = bacaTemaTerang();
  terapkanTema(temaTerang, tombolTema);
  tombolTema.addEventListener("click", () => {
    temaTerang = !temaTerang;
    terapkanTema(temaTerang, tombolTema);
  });
}

inisialisasiTema();
