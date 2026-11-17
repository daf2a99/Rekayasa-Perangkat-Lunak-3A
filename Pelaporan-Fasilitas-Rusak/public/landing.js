/* ── SET TAHUN FOOTER DINAMIS ── */
document.getElementById("year").textContent = new Date().getFullYear();

/* ── LOGIKA TEMA TERANG/GELAP ── */
const themeBtn = document.getElementById("theme-btn");

// Ambil pilihan tema terakhir (kalau ada), default terang
let isLight = true;
try {
  isLight = localStorage.getItem("theme") !== "dark";
} catch (e) {
  // localStorage tidak tersedia, pakai default terang
}

function applyTheme() {
  // Jika isLight true, set class ke 'light', jika false set ke 'dark'
  document.body.className = isLight ? "light" : "dark";
  themeBtn.setAttribute("aria-pressed", String(!isLight));
  try {
    localStorage.setItem("theme", isLight ? "light" : "dark");
  } catch (e) {
    // abaikan jika penyimpanan diblokir
  }
}

applyTheme();

themeBtn.addEventListener("click", () => {
  isLight = !isLight;
  applyTheme();
});