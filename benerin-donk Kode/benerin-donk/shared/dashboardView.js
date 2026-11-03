/* Antarmuka dashboard: penjaga halaman, nama pengguna, dan tombol keluar. */

function jagaHalaman(konfigurasi) {
  if (!sudahLogin(konfigurasi.kunciSesi)) {
    window.location.replace(konfigurasi.halamanLogin);
  }
}

function tampilkanNamaPengguna(konfigurasi) {
  const elemenNama = document.getElementById("nama-user");
  if (!elemenNama) return;
  elemenNama.textContent = ambilNamaPengguna(konfigurasi.kunciSesi) || konfigurasi.namaPeran;
}

function pasangTombolKeluar(konfigurasi) {
  const tombolKeluar = document.getElementById("logout-btn");
  if (!tombolKeluar) return;
  tombolKeluar.addEventListener("click", () => {
    hapusSesi(konfigurasi.kunciSesi);
    window.location.href = konfigurasi.halamanLogin;
  });
}

function inisialisasiDashboard(konfigurasi) {
  tampilkanNamaPengguna(konfigurasi);
  pasangTombolKeluar(konfigurasi);
}
