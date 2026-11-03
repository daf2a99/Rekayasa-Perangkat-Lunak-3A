/* Titik masuk login Pemimpin: merangkai konfigurasi dan repository, lalu menjalankan antarmuka. */

// Mode demo: kredensial diperiksa di browser. Hapus akunDemo sebelum dipakai sungguhan.
const akunDemo = { username: "pemimpin", password: "pemimpin123" };

inisialisasiHalamanLogin({
  ...konfigurasiPeran,
  repository: buatRepositoryDemo(akunDemo),
  // Saat backend siap: repository: buatRepositoryApi("/api/pemimpin/login"),
});
