/* Titik masuk login Admin: merangkai konfigurasi dan repository, lalu menjalankan antarmuka. */

// Mode demo: kredensial diperiksa di browser. Hapus akunDemo sebelum dipakai sungguhan.
const akunDemo = { username: "admin", password: "admin123" };

inisialisasiHalamanLogin({
  ...konfigurasiPeran,
  repository: buatRepositoryDemo(akunDemo),
  // Saat backend siap: repository: buatRepositoryApi("/api/admin/login"),
});
