## Tujuan

Membangun ulang web app "Ordner Akuntansi - NasHKB" sebagai project React di Lovable — struktur, layout, dan style mengikuti source code asli (Poppins, aksen navy #183669 & gold #D4AF37, kartu ordner, tabel admin, label print), dengan perubahan yang diminta.

## Halaman

```text
/                 Dashboard  (publik, tanpa login)
/detail/$id       Detail Ordner (publik)
/print            Print Label (publik, ?id=... atau ?ids=a,b,c)
/admin            Admin Panel (kelola data ordner)
/auth             Login / Sign Up admin
/verifikasi       Verifikasi User (khusus Owner)
```

## Hak akses

| Aksi | Anon (belum login) | Login & approved (admin/owner) |
|---|---|---|
| Lihat Dashboard & Detail | Ya | Ya |
| Pilih ordner untuk print (checkbox) | Ya | Ya |
| Buka halaman Print & cetak label | Ya | Ya |
| Tambah / Edit / Hapus ordner | Tidak | Ya |
| Toggle status Sudah/Belum Print | Tidak (badge read-only) | Ya |
| Halaman Verifikasi User | Tidak | Hanya role `owner` |

Helper `canEdit = user && status === 'approved'` **hanya** mengatur tombol Tambah/Edit/Hapus dan badge status. Tombol/ikon/menu terkait print (checkbox "Pilih untuk Print", panel bulk print, tombol "Print Label"/"Cetak Sekarang") **tidak boleh** dikaitkan dengan `canEdit` — selalu tampil dan berfungsi untuk semua pengunjung.

## Style & Warna

- CSS variable dari `css/style.css` dipindahkan ke `src/styles.css` (navy-primary #183669, navy-secondary, navy-deep, gold-primary #D4AF37 / hover / light, bg-light, shadow-sm/md/lg, radius 12px), termasuk body background gradient.
- **Header/navbar + area header dashboard**: gradien **putih → biru muda** (bukan navy solid), garis bawah gold dipertahankan, teks disesuaikan agar kontras.
- **Teks pada list/kartu ordner** (kode, jenis, no urut, tahun, nomor dokumen) memakai **navy #183669**.
- Poppins dimuat lewat `<link>` Google Fonts di root route.

## Logo — konsisten di semua halaman

| Logo | Sumber | Ukuran & posisi |
|---|---|---|
| NAS | file `pic/33047458-fotor-20260711105326.png` (di-upload ke CDN aset) | 35px di navbar semua halaman; 50px di baris logo halaman Print |
| Danantara | file `pic/danantara.png` | 35px di header dashboard |
| BUMN | file `pic/bumn.png` | 140px di kartu Total Dokumen |
| HK Bhirawa | link asli `https://bhirawasteel.com/wp-content/uploads/2023/01/cropped-Logo-HK-Bhirawa-300x85-1.png` | 50px di header dashboard & baris logo halaman Print; **di header setiap Label Print tetap memakai link ini persis** |
| AKHLAK | link asli BNI (`LOGO-AKHLAK-NOBG-v2.jpg`) | 55px di kartu Total Ordner |

Dipakai lewat satu komponen/konstanta bersama agar identik di Dashboard, Detail, Admin Panel, dan Print.

## Halaman Print Label — ukuran FINAL, tidak diubah sedikit pun

- Template ukuran (final, tanpa pembulatan / auto-scale):
  - `Otomatis Pas (Skala 90%)` = **63mm × 180mm** — default terpilih
  - `Ukuran Penuh (Tanpa Margin)` = **70mm × 200mm**
  - margin label **0mm** untuk kedua mode
- Grid halaman: A4 landscape 297mm × 210mm, gap antar label 2mm, padding 5mm (tampilan layar), `@page { size: A4 landscape; margin: 0 }` saat print, label rata tengah.
- **Maksimal 4 label per halaman.** Bila dipilih lebih dari 4 ordner (mis. 8), label dipecah otomatis menjadi grup berisi maks. 4 label; tiap grup = satu halaman cetak dengan page-break antar grup. Ukuran label **tidak** diperkecil agar muat — 8 ordner → 2 halaman × 4 label berukuran sama persis.
- `page-break-inside: avoid` per label agar tidak ada label terpotong ke halaman lain.
- Batas pemilihan 4 ordner di Dashboard dilepas (sistem yang membagi per 4); fitur ini tetap terbuka untuk anon.
- Detail label disalin apa adanya dari `print.html`: border ganda 2px + 1px; header logo 16% tinggi dengan border-bottom 4px; body (no urut 38cqw #556B2F dengan stroke & text-shadow, jenis/singkatan 16cqw memakai `warnaJenis`, tahun 20cqw #87CEEB); footer 27% dengan judul 7.5cqw, nilai 17cqw, divider italic 5.5cqw; semua field `contenteditable` dengan highlight gold; aturan `@media print` identik.

## Perubahan 1 — Supabase (Cloud) menggantikan GitHub API

- Tabel `ordner`: id, kode, no_urut, jenis, singkatan, warna_jenis, tahun, nomor_awal, nomor_akhir, jumlah, status, keterangan, dokumen (jsonb), created_at, updated_at.
- Tabel `profiles`: user_id, email, role (`owner` | `admin`), status (`pending` | `approved` | `rejected`).
- Trigger otomatis membuat baris `profiles` saat sign up (status `pending`, role `admin`); email **nasotp1@gmail.com** otomatis role `owner` + status `approved`.
- RLS `ordner`: **SELECT terbuka untuk anon** (dipakai dashboard, detail, dan halaman print tanpa login); INSERT/UPDATE/DELETE hanya untuk user berstatus `approved`. `profiles` hanya bisa di-update oleh role `owner`. Pengecekan lewat fungsi security-definer agar tidak terjadi rekursi RLS.
- Seed 8 data ordner dari `data.json` (BBK 01–08) lewat migrasi, status lama Aktif → **Sudah Print**, Inaktif → **Belum Print**.
- Supabase Auth email + password, konfirmasi email **dimatikan** sehingga bisa langsung login setelah daftar.
- Setelah login, status `pending` → pesan "Menunggu verifikasi dari Owner", Admin Panel belum bisa diakses.
- Halaman **Verifikasi User** (hanya Owner): daftar pendaftar dengan tombol Approve / Reject. Setelah approve, user langsung punya akses data ordner **sama persis** dengan Owner.

## Perubahan 2 — Status "Sudah Print" / "Belum Print"

- Istilah Aktif/Inaktif diganti di semua tempat: form tambah/edit, badge kartu dashboard, filter/pencarian, kolom tabel Admin Panel, dan halaman Detail.
- Warna badge: hijau (#d1fae5 / #065f46) untuk **Sudah Print**, merah (#fee2e2 / #991b1b) untuk **Belum Print**.
- Di Detail dan Admin Panel, badge bisa diklik untuk toggle dan langsung tersimpan ke Supabase — hanya bila login & approved; selain itu badge read-only.

## Perubahan 3 — Tombol "Print Label"

Di halaman Detail, tombol Print Cover Ordner memakai style `btn-outline` (putih dengan border) persis seperti tombol "← Kembali" di sebelahnya, dan tetap tampil untuk pengunjung anon.

## Catatan teknis

- Field data ordner lain (kode, noUrut, jenis, singkatan, warnaJenis, tahun, nomorAwal, nomorAkhir, jumlah, keterangan, dokumen) tetap sama seperti source code.
- Panel bulk-print melayang dan pencarian dashboard dipertahankan; penghitung terpilih menampilkan jumlah ordner dan perkiraan jumlah halaman cetak.
- Setiap halaman mendapat title/description sendiri untuk SEO.
