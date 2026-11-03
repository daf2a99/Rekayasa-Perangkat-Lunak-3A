/* Pengujian lapisan Controller dan Repository untuk FR-10.
   Jalankan: node tests/auth.test.js */
const assert = require("node:assert/strict");
const test = require("node:test");
const {
  pesanError,
  validasiKredensial,
  buatRepositoryDemo,
  buatRepositoryApi,
  prosesLogin,
  buatPembatasPercobaan,
} = require("../shared/auth.js");

const akunDemo = { username: "admin", password: "admin123" };
const buatRepositoryUji = () => {
  const repository = buatRepositoryDemo(akunDemo, 0);
  const asli = repository.cekKredensial;
  repository.jumlahPanggilan = 0;
  repository.cekKredensial = (...argumen) => {
    repository.jumlahPanggilan += 1;
    return asli(...argumen);
  };
  return repository;
};

test("TC-01 kredensial valid: login berhasil", async () => {
  const hasil = await prosesLogin(buatRepositoryUji(), "admin", "admin123");
  assert.deepEqual(hasil, { ok: true });
});

test("TC-02 password kosong: ditolak pada tahap validasi", async () => {
  const repository = buatRepositoryUji();
  const hasil = await prosesLogin(repository, "admin", "");
  assert.equal(hasil.ok, false);
  assert.equal(hasil.tahap, "validasi");
  assert.equal(hasil.pesan, pesanError.passwordKosong);
  assert.deepEqual(hasil.kolom, ["password"]);
  assert.equal(repository.jumlahPanggilan, 0);
});

test("TC-03 username dan password kosong: kedua kolom ditandai", () => {
  const hasil = validasiKredensial("", "");
  assert.equal(hasil.valid, false);
  assert.equal(hasil.pesan, pesanError.keduaKolomKosong);
  assert.deepEqual(hasil.kolom, ["username", "password"]);
});

test("TC-04 SQL injection pada username: ditolak oleh validasi format", async () => {
  const repository = buatRepositoryUji();
  const hasil = await prosesLogin(repository, "' OR '1'='1", "apa-saja");
  assert.equal(hasil.ok, false);
  assert.equal(hasil.tahap, "validasi");
  assert.equal(hasil.pesan, pesanError.usernameFormat);
  assert.equal(repository.jumlahPanggilan, 0);
});

test("TC-05 SQL injection pada password: diperlakukan sebagai teks biasa", async () => {
  const hasil = await prosesLogin(buatRepositoryUji(), "admin", "' OR '1'='1' --");
  assert.equal(hasil.ok, false);
  assert.equal(hasil.tahap, "otentikasi");
  assert.equal(hasil.pesan, pesanError.kredensialSalah);
});

test("TC-06 password salah: ditolak dengan pesan umum", async () => {
  const hasil = await prosesLogin(buatRepositoryUji(), "admin", "salah");
  assert.equal(hasil.ok, false);
  assert.equal(hasil.pesan, pesanError.kredensialSalah);
});

test("TC-07 username melebihi batas panjang: ditolak", () => {
  const hasil = validasiKredensial("a".repeat(51), "admin123");
  assert.equal(hasil.valid, false);
  assert.equal(hasil.pesan, pesanError.usernameTerlaluPanjang);
});

test("TC-08 lima kegagalan berturut-turut: pembatas aktif pada percobaan ke-5", () => {
  const pembatas = buatPembatasPercobaan(5);
  const hasilPerPercobaan = [1, 2, 3, 4, 5].map(() => pembatas.catatGagal());
  assert.deepEqual(hasilPerPercobaan, [false, false, false, false, true]);
});

test("TC-09 server mengembalikan 429 dan 500: pesan sesuai status", async () => {
  const fetchAsli = global.fetch;
  try {
    global.fetch = async () => ({ status: 429, ok: false });
    const hasil429 = await buatRepositoryApi("/api/admin/login").cekKredensial("admin", "x");
    assert.equal(hasil429.pesan, pesanError.terlaluBanyakPercobaan);

    global.fetch = async () => ({ status: 500, ok: false });
    const hasil500 = await buatRepositoryApi("/api/admin/login").cekKredensial("admin", "x");
    assert.equal(hasil500.pesan, pesanError.kesalahanServer);
  } finally {
    global.fetch = fetchAsli;
  }
});

test("TC-10 server tidak terjangkau: pesan gagal terhubung", async () => {
  const fetchAsli = global.fetch;
  try {
    global.fetch = async () => {
      throw new TypeError("fetch failed");
    };
    const hasil = await buatRepositoryApi("/api/admin/login").cekKredensial("admin", "x");
    assert.equal(hasil.ok, false);
    assert.equal(hasil.pesan, pesanError.tidakTerhubung);
  } finally {
    global.fetch = fetchAsli;
  }
});
