Nama Anggota Kelompok 9:
- Daffa Haqurrizqo Rabbany (1251420091)
- Naufal Fadhlan (1251420002)
- Ananda Ahmad Firjatullah (1251420048)
- Helmi Yahya Prasetyo (1251420085)

# Sistem Pelaporan Fasilitas Rusak

## 1. Layanan yang Dipilih
Layanan yang dipilih adalah Sistem Pelaporan Fasilitas Rusak. Sistem ini dirancang untuk memfasilitasi proses pelaporan kerusakan di lingkungan FST UIN Syarif Hidayatullah Jakarta, mulai dari pengajuan praktis (tanpa login), pencarian riwayat, verifikasi oleh staf, pembaruan status pengerjaan, hingga rekapitulasi data pimpinan.

## 2. Fitur Unggulan
Fitur unggulan yang diusulkan adalah **Automated Photo Compression**, yaitu fitur pengelolaan media yang memproses ukuran dan kualitas file foto bukti kerusakan secara otomatis di latar belakang (*background process*) sebelum disimpan ke dalam server.

Pihak yang terlibat meliputi mahasiswa/dosen sebagai pelapor (yang mengunggah foto), sistem modul media (sebagai pemroses kompresi), dan Staf Sarpras (yang memverifikasi laporan dengan waktu muat gambar yang cepat). Setiap pihak memiliki interaksi yang berbeda terhadap fitur ini.

Dengan adanya fitur ini, kapasitas penyimpanan server dapat dihemat secara signifikan, dan waktu muat (*loading*) halaman daftar laporan di dasbor pengelola menjadi lebih cepat tanpa mengurangi detail visual kerusakan yang dilaporkan.

## 3. Analisis Kebutuhan
1. Sebagai mahasiswa/dosen, saya membutuhkan fasilitas pengajuan laporan kerusakan beserta unggah foto secara online tanpa harus login, agar saya dapat melaporkan masalah dengan cepat.
2. Sebagai mahasiswa/dosen, saya membutuhkan fitur pencarian status menggunakan NIM/Kode Unik, agar saya dapat mengetahui perkembangan laporan tanpa harus membuat akun.
3. Sebagai Staff Sarpras, saya membutuhkan data laporan dan foto kerusakan yang terorganisir, agar proses verifikasi dan penugasan teknisi dapat dilakukan dengan mudah dan terkontrol.
4. Sebagai Staff Sarpras, saya membutuhkan sistem yang dapat meminimalkan ukuran file foto secara otomatis, agar server fakultas tidak cepat penuh meskipun intensitas laporan tinggi.
5. Sebagai Dekanat/Kaprodi, saya membutuhkan dasbor analitik rekapitulasi, agar saya dapat mengevaluasi tingkat kerusakan fasilitas dan kecepatan penanganan.

## 4. Arsitektur dan Modul Sistem
Arsitektur sistem dirancang menggunakan pendekatan MVC (Model-View-Controller) berbasis web. Untuk memastikan prinsip tanggung jawab yang jelas (*High Cohesion*), sistem dibagi menjadi beberapa modul:
- **Modul Pengajuan:** Mengelola input form pelaporan publik dan pencarian riwayat status.
- **Modul Media (Kompresi):** Mengelola validasi, pemrosesan (*resize* & *compress*), dan penyimpanan file foto.
- **Modul Verifikasi:** Mengelola perubahan status laporan oleh Staff Sarpras.
- **Modul Analitik:** Mengelola data agregasi untuk dasbor pimpinan.

Gambar arsitektur sistem beserta label hubungan antarkomponen akan dilampirkan secara terpisah pada file architecture.png.

## 5. Alur Fitur Unggulan
Fitur kompresi otomatis ini menghubungkan proses pengajuan laporan dengan penyimpanan server. Alur dimulai ketika pelapor mengisi formulir kerusakan dan melampirkan file foto bukti.

Modul media kemudian melakukan validasi awal. **(Kondisi Gagal):** Jika file yang diunggah bukan format gambar (misal: PDF/DOCX) atau ukurannya melebihi 10MB, sistem akan menolak proses dan menampilkan pesan error di layar pelapor untuk meminta file yang sesuai.

Jika validasi berhasil, sistem menampung file sementara dan menjalankan kompresi dimensi serta *lossy compression* di latar belakang. Setelah ukuran file menjadi jauh lebih ringan, foto disimpan secara permanen di server dan tautannya diteruskan ke database laporan. Staf Sarpras kemudian dapat melihat foto tersebut dengan cepat saat melakukan verifikasi.

Gambar alur fitur akan dibuat dan dilampirkan secara terpisah.

## 6. Alasan dan Keputusan Desain
Sistem dirancang dengan beberapa keputusan strategis berdasarkan kebutuhan pengguna dan efisiensi teknis:
1. **Pemisahan Modul Media dengan Pengajuan:** Dipilih agar tingkat ketergantungan antar-modul rendah (*Low Coupling*). Jika lokasi penyimpanan diubah dari server lokal ke *cloud*, Modul Pengajuan tidak akan ikut terdampak.
2. **Pemrosesan di Latar Belakang (*Background Processing*):** Dipilih karena kompresi gambar membutuhkan waktu. Dengan eksekusi di latar belakang, pengguna tidak akan mengalami *freeze* atau "layar memuat" yang lama saat menekan tombol kirim.
3. **Peniadaan Login Pelapor dan Akses Teknisi:** Dipilih untuk memangkas birokrasi aplikasi. Pelapor dapat melapor seketika itu juga, sementara progres perbaikan teknisi cukup diwakilkan pembaruannya oleh Staf Sarpras.

## 7. Asumsi Tim
- Sistem digunakan oleh mahasiswa/dosen (pelapor tanpa login), Staf Sarpras, dan Dekanat/Kaprodi.
- Setiap pengelola memiliki akun dan hak akses sesuai perannya.
- Master data gedung dan ruangan telah dikonfigurasi oleh pihak berwenang.
- Keputusan teknis perbaikan mengikuti SOP pihak sarpras secara *offline*, sistem hanya memfasilitasi pencatatan digitalnya.
- Dokumen foto diunggah melalui form publik yang sudah tervalidasi batasan ekstensinya.

## 8. Kesimpulan
Sistem Pelaporan Fasilitas Rusak dirancang sebagai platform terintegrasi yang mempercepat alur pelaporan antara civitas akademika dan pengelola sarpras, tanpa dihalangi oleh birokrasi aplikasi yang rumit.

Fitur **Automated Photo Compression** menjadi ujung tombak sistem karena mampu menjamin efisiensi sumber daya server dan kecepatan akses. Didukung perancangan modul yang terpisah dan penyesuaian hak akses yang tepat, sistem pengelolaan fasilitas ini siap diandalkan dalam jangka panjang.
