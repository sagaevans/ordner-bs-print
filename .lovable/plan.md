# Filter Kolom Gaya Excel di Admin Panel

Menambahkan tombol filter (ikon panah) di setiap header kolom tabel Admin Panel, persis seperti AutoFilter di Excel.

## Yang akan dibuat

Setiap header kolom — Kode, No. Urut, Jenis Dokumen, Tahun, No. Dokumen, Jumlah, Status — mendapat ikon panah kecil di sisi kanan. Klik ikon membuka panel dropdown berisi:

- **Sort A ke Z / Z ke A** (untuk angka: kecil→besar / besar→kecil)
- **Kotak Search** untuk menyaring daftar nilai di bawahnya
- **Daftar checkbox** semua nilai unik pada kolom tersebut, dengan opsi **(Pilih Semua)** di paling atas
- Tombol **OK** dan **Batal**

```text
KODE ▼            <- klik ikon
 ┌────────────────────────┐
 │ A→Z  Urutkan naik      │
 │ Z→A  Urutkan turun     │
 ├────────────────────────┤
 │ [ Cari...            ] │
 │ ☑ (Pilih Semua)        │
 │ ☑ BBK 01               │
 │ ☑ BBK 02               │
 │ ☑ KPI 2025             │
 ├────────────────────────┤
 │        [OK] [Batal]    │
 └────────────────────────┘
```

## Perilaku

- Filter antar kolom bersifat **AND** — memilih Tahun 2026 lalu Status "Belum Print" hanya menampilkan baris yang memenuhi keduanya.
- Daftar nilai unik pada tiap dropdown dihitung dari data yang sudah tersaring oleh kolom lain (seperti Excel), sehingga tidak muncul pilihan yang menghasilkan nol baris.
- Kolom yang sedang aktif difilter ikonnya berubah (ikon corong) agar terlihat jelas.
- **Filter bisa aktif di banyak kolom sekaligus** (misal Kode + Tahun + Status bersamaan), persis seperti Excel. Yang hanya boleh satu dalam satu waktu adalah **urutan sort** — memilih sort di kolom lain hanya memindahkan urutan ke kolom itu, tanpa menghapus filter kolom mana pun.
- Kotak pencarian global "Cari data..." di atas tabel **tetap ada** dan bekerja bersama filter kolom.
- Tombol **Reset Filter** muncul di header saat ada filter/sort aktif, untuk mengembalikan tampilan ke semula.
- Dropdown menutup saat klik di luar area atau tekan Escape.
- Semua ini murni tampilan/klien — tidak ada perubahan database, hak akses, maupun tombol Tambah/Edit/Hapus.

## Catatan teknis

- Komponen baru `src/components/ColumnFilter.tsx`: popover berisi sort, search, checkbox list, OK/Batal. Posisi absolut relatif terhadap sel header, dengan `overflow` tabel disesuaikan agar dropdown tidak terpotong.
- State di `src/routes/admin.tsx`: `filters: Record<string, Set<string>>` (kosong = semua nilai lolos) dan `sort: { key, dir } | null`.
- Nilai kolom "No. Dokumen" diperlakukan sebagai string gabungan `nomor_awal s/d nomor_akhir` agar cocok dengan yang ditampilkan.
- Kolom numerik (No. Urut, Tahun, Jumlah) diurutkan secara numerik, bukan alfabet.
- Styling memakai token warna yang sudah ada (navy #183669 / gold) di `src/styles.css`, tanpa hardcode warna baru.
