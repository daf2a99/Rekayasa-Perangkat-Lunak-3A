Nama Anggota Kelompok 9:

\- Daffa Haqurrizqo Rabbany (1251420091)

\- Naufal Fadhlan (1251420002)

\- Ananda Ahmad Firjatullah (1251420048)

\- Helmi Yahya Prasetyo (1251420085)

\# Pelaporan Fasilitas Rusak

\## 1. Layanan yang Dipilih

Layanan yang dipilih adalah Pelaporan Fasilitas Rusak. Sistem ini dirancang untuk membantu proses pelaporan kerusakan fasilitas di lingkungan FST UIN Syarif Hidayatullah Jakarta mulai dari pengajuan laporan, verifikasi, penugasan teknisi, pelaksanaan perbaikan, hingga penilaian dan pemantauan status secara transparan.

\## 2. Fitur Unggulan

Fitur unggulan yang diusulkan adalah Automated Photo Compression (Kompresi Foto Otomatis), yaitu fitur non-fungsional yang secara otomatis mengompresi ukuran file foto bukti kerusakan fasilitas yang diunggah oleh mahasiswa atau dosen di latar belakang server.

Pihak yang terlibat meliputi mahasiswa/dosen sebagai pelapor, staf sarana dan prasarana (sarpras) sebagai verifikator dan pengelola penugasan, serta teknisi lapangan sebagai eksekutor perbaikan. Setiap pihak memiliki hak akses dan fungsi yang berbeda sesuai dengan perannya.

Dengan adanya fitur kompresi foto otomatis ini, kapasitas penyimpanan server dapat dihemat secara optimal dan waktu muat (loading) halaman laporan menjadi lebih cepat, tanpa mengurangi kejelasan visual atau detail gambar kerusakan yang dikirimkan.

\## 3. Analisis Kebutuhan

1\. Sebagai mahasiswa atau dosen, saya membutuhkan fasilitas pengajuan laporan kerusakan fasilitas beserta unggah foto bukti secara online, agar saya tidak perlu datang langsung atau menggunakan media yang terpisah.

2\. Sebagai mahasiswa atau dosen, saya membutuhkan informasi status pengajuan laporan, agar saya dapat mengetahui perkembangan perbaikan fasilitas tanpa harus menanyakan status secara terpisah.

3\. Sebagai Staff Sarpras, saya membutuhkan data laporan dan foto kerusakan mahasiswa yang terorganisir, agar proses verifikasi dan penugasan teknisi dapat dilakukan dengan lebih mudah dan terkontrol.

4\. Sebagai Staff Sarpras, saya membutuhkan sistem yang dapat memproses ukuran file foto secara otomatis, agar penyimpanan server tetap efisien meskipun banyak laporan masuk.

5\. Sebagai teknisi lapangan, saya membutuhkan informasi detail mengenai lokasi ruang dan deskripsi kerusakan, agar proses perbaikan dapat segera dilakukan dengan tepat sasaran.

6\. Sebagai pelapor, saya membutuhkan informasi hasil penanganan atau konfirmasi penyelesaian perbaikan, agar saya dapat mengetahui bahwa fasilitas telah dapat digunakan kembali.

\## 4. Arsitektur Sistem

Arsitektur sistem dirancang menggunakan pendekatan berbasis web dengan pola MVC (Model-View-Controller). Seluruh pengguna mengakses sistem melalui antarmuka yang sama, kemudian sistem memproses permintaan berdasarkan hak akses dan peran masing-masing pengguna.

Data seperti informasi laporan, kategori kerusakan, status, penilaian, dan riwayat disimpan secara terpusat pada database relasional. Dokumen foto kerusakan dikelola melalui direktori media server yang terintegrasi dengan modul kompresi otomatis sehingga dapat diakses oleh pihak yang memiliki kewenangan.

Gambar arsitektur sistem akan dibuat dan dilampirkan secara terpisah pada file architecture.png.

\## 5. Alur Fitur Unggulan

Fitur Automated Photo Compression menghubungkan proses pengelolaan media sejak awal laporan dikirimkan. Alur dimulai ketika pelapor mengisi formulir kerusakan dan memilih file foto bukti.

Sebelum file disimpan secara permanen ke dalam server, sistem secara otomatis menjalankan proses kompresi gambar di latar belakang untuk memperkecil ukuran file tanpa merusak kualitas detail visualnya.

Setelah proses kompresi selesai, data laporan beserta foto yang telah dioptimalkan disimpan ke database, lalu diteruskan ke Staff Sarpras untuk diverifikasi dan ditugaskan kepada teknisi.

Gambar alur fitur akan dibuat dan dilampirkan secara terpisah.

\## 6. Alasan Desain

Sistem dirancang dalam satu platform terpusat karena proses pelaporan fasilitas melibatkan beberapa pihak dengan tanggung jawab yang berbeda. Dengan sistem yang terintegrasi, setiap pihak dapat mengakses informasi yang dibutuhkan tanpa harus menggunakan media manual yang terpisah.

Sistem juga menggunakan pembagian hak akses berdasarkan peran agar setiap pengguna hanya dapat melakukan aktivitas sesuai tanggung jawabnya. Selain itu, fitur kompresi foto dipilih agar performa aplikasi tetap cepat dan tidak membebani kapasitas penyimpanan server fakultas.

Fitur tracking status juga dipilih karena pelapor perlu mengetahui perkembangan perbaikan tanpa harus menanyakan status secara manual kepada pihak pengelola.

\## 7. Asumsi Tim

\- Sistem digunakan oleh mahasiswa/dosen, Staff Sarpras, dan teknisi lapangan.

\- Setiap pengguna memiliki akun dan hak akses sesuai dengan perannya di lingkungan fakultas.

\- Kategori fasilitas dan daftar lokasi gedung atau laboratorium telah dimasukkan sebelumnya oleh pihak yang berwenang.

\- Proses pengajuan, verifikasi, penugasan, dan perbaikan mengikuti ketentuan operasional penanganan fasilitas kampus.

\- File foto bukti kerusakan diunggah dalam format gambar yang didukung oleh sistem sebelum dikompresi otomatis.

\- Sistem digunakan untuk mengotomatisasi dan mengintegrasikan layanan pelaporan, sedangkan keputusan teknis penanganan tetap berada pada pihak sarpras.

\## 8. Kesimpulan

Sistem Pelaporan Fasilitas Rusak dirancang sebagai platform terintegrasi yang menghubungkan pelapor, pengelola sarpras, dan teknisi dalam satu alur layanan yang transparan.

Fitur Automated Photo Compression menjadi fitur unggulan karena mampu menjaga efisiensi ruang penyimpanan dan kecepatan akses sistem secara otomatis, sehingga seluruh proses penanganan fasilitas dapat berjalan efektif dan terpantau dengan baik.