# Ordner Akuntansi — NasHKB

Aplikasi web manajemen ordner dan cetak label untuk kebutuhan akuntansi internal. Dibangun ulang dari codebase HTML/CSS/JS statis menjadi aplikasi modern berbasis React dengan backend cloud, autentikasi berbasis role, serta generator label cetak yang presisi.

## Pratinjau

- **Dashboard publik**: daftar ordner dengan pencarian, filter status, statistik, dan pemilihan label untuk cetak.
- **Detail Ordner**: tampilan lengkap setiap ordner beserta daftar dokumen.
- **Print Label**: generator label cetak A4 landscape dengan tata letak 4 label per halaman dan dua template ukuran (63mm × 180mm dan 70mm × 200mm).
- **Admin Panel**: halaman khusus admin/owner untuk mengelola data ordner.
- **Verifikasi User**: halaman khusus owner untuk menyetujui atau menolak pendaftaran admin.

## Teknologi

- **Framework**: [TanStack Start](https://tanstack.com/start) v1 (React 19 + full-stack SSR/SSG + Vite 7)
- **Bahasa**: TypeScript
- **Styling**: Tailwind CSS v4 + CSS custom properties / theme variables
- **Backend/Database**: Supabase (PostgreSQL + Row Level Security + Auth)
- **UI/UX**: Poppins, shadcn/ui komponen, dan desain token navy-gold
- **Ikon**: Lucide React

## Warna & Desain

| Token | Nilai | Penggunaan |
| --- | --- | --- |
| Navy primary | `#183669` | Teks kartu, heading, brand accent |
| Navy secondary | `#1a4a7a` | Elemen sekunder |
| Navy deep | `#0f2a4d` | Background komponen dalam |
| Gold primary | `#D4AF37` | Garis bawah header, badge, highlight, accent |
| Gold hover | `#BFA030` | Hover state gold |
| Gold light | `#F9F1D8` | Background highlight/editable |
| Background | `#f8fafc` | Body / page background |

Header dan navbar memakai gradien putih → biru muda dengan garis bawah gold solid.

## Struktur Halaman

| Rute | Akses | Deskripsi |
| --- | --- | --- |
| `/` | Publik | Dashboard daftar ordner, statistik, pencarian, filter, bulk print |
| `/detail/$id` | Publik | Detail ordner dan daftar dokumen |
| `/print` | Publik | Halaman cetak label (query `?id=...` atau `?ids=a,b,c`) |
| `/admin` | Admin/Owner approved | Panel kelola data ordner (tambah/edit/hapus) |
| `/auth` | Publik | Login dan sign up admin |
| `/verifikasi` | Owner | Daftar pendaftar admin dengan approve/reject |

## Hak Akses & Role

Aplikasi menggunakan tabel `profiles` dengan struktur role:

- `owner`: akun pemilik (email `nasotp1@gmail.com` otomatis menjadi owner dan langsung approved). Dapat mengelola user di halaman `/verifikasi`.
- `admin`: akun yang didaftarkan via sign up. Status awal `pending` sampai di-approve oleh owner.
- **Anonim (belum login)**: hanya bisa melihat dashboard, detail, dan mencetak label.
- **Approved user** (owner maupun admin): memiliki akses penuh terhadap data ordner (tambah, edit, hapus, toggle status) tetapi hanya owner yang boleh mengelola user.

## Status Ordner

Field `status` pada tabel `ordner` memiliki dua nilai:

- **Sudah Print** — badge hijau (`#d1fae5` / `#065f46`)
- **Belum Print** — badge merah (`#fee2e2` / `#991b1b`)

Mapping dari data lama: `Aktif` → `Sudah Print`, `Inaktif` → `Belum Print`.

Badge status di halaman Detail dan Admin Panel dapat diklik untuk toggle langsung ke database, **hanya** oleh user yang sudah login dan approved. Untuk pengunjung anonim, badge bersifat read-only.

## Skema Data

### Tabel `ordner`

| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| `id` | uuid | Primary key, auto-generated |
| `kode` | text | Kode unik ordner |
| `no_urut` | text | Nomor urut |
| `jenis` | text | Jenis ordner |
| `singkatan` | text | Singkatan jenis |
| `warna_jenis` | text | Warna representasi jenis |
| `tahun` | text | Tahun |
| `nomor_awal` | text | Nomor awal dokumen |
| `nomor_akhir` | text | Nomor akhir dokumen |
| `jumlah` | text | Jumlah dokumen |
| `status` | text | `Sudah Print` / `Belum Print` |
| `keterangan` | text | Keterangan tambahan |
| `dokumen` | jsonb | Array daftar dokumen |
| `created_at` | timestamptz | Waktu pembuatan |
| `updated_at` | timestamptz | Waktu pembaruan |

### Tabel `profiles`

| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| `id` | uuid | Primary key, merujuk `auth.users.id` |
| `email` | text | Email user |
| `role` | `app_role` | `owner` atau `admin` |
| `status` | `profile_status` | `pending` / `approved` / `rejected` |
| `created_at` | timestamptz | Waktu pembuatan |

## Row Level Security (RLS)

- `ordner`:
  - `SELECT` terbuka untuk publik (termasuk anonim).
  - `INSERT`, `UPDATE`, `DELETE` hanya untuk user yang login dan berstatus `approved`.
- `profiles`:
  - Hanya role `owner` yang boleh `SELECT` semua baris dan `UPDATE` status/role.
  - User biasa hanya bisa melihat profilnya sendiri (bukan diaktifkan untuk admin).

Trigger `handle_new_user` dijalankan saat user sign up:
- Email `nasotp1@gmail.com` → role `owner`, status `approved`.
- Email lain → role `admin`, status `pending`.

Konfirmasi email dinonaktifkan sehingga user dapat langsung login setelah sign up.

## Print Label

Halaman `/print` menghasilkan layout cetak siap pakai.

### Template Ukuran

| Template | Lebar | Tinggi | Margin | Default |
| --- | --- | --- | --- | --- |
| Otomatis Pas (Skala 90%) | 63mm | 180mm | 0mm | Ya |
| Ukuran Penuh (Tanpa Margin) | 70mm | 200mm | 0mm | Tidak |

### Aturan Layout

- Kertas A4 landscape `297mm × 210mm`.
- Maksimal **4 label per halaman**.
- Gap antar label `2mm`, padding layar `5mm`.
- Jika dipilih lebih dari 4 ordner, sistem otomatis membagi ke halaman berikutnya (`page-break-after: always`) tanpa mengubah ukuran label.
- `@page { size: A4 landscape; margin: 0 }` saat print.
- `page-break-inside: avoid` per label agar tidak terpotong.
- Label di tengah halaman secara horizontal.

## Logo & Aset

Aset logo disediakan melalui kombinasi file lokal yang diunggah ke CDN dan link eksternal:

| Logo | Sumber | Ukuran (typical) | Lokasi muncul |
| --- | --- | --- | --- |
| NAS | Lokal (`pic/33047458-fotor-20260711105326.png`) | 35px navbar; 50px halaman Print | Navbar, header Print |
| Danantara | Lokal (`pic/danantara.png`) | 35px | Header Dashboard |
| BUMN | Lokal (`pic/bumn.png`) | 140px | Kartu Total Dokumen |
| HK Bhirawa | Eksternal `https://bhirawasteel.com/wp-content/uploads/2023/01/cropped-Logo-HK-Bhirawa-300x85-1.png` | 50px | Header Dashboard, header Label Print |
| AKHLAK | Eksternal (BNI) | 55px | Kartu Total Ordner |

Semua logo direferensikan melalui `src/lib/logos.ts` agar konsisten di setiap halaman.

## Cara Menjalankan

### Persyaratan

- Node.js ≥ 18 (disarankan menggunakan [nvm](https://github.com/nvm-sh/nvm))
- Package manager: `npm` atau `bun`

### Instalasi

```sh
# Clone repositori
git clone <repository-url>
cd <repository-name>

# Install dependensi
npm install
# atau
bun install
```

### Mode Development

```sh
npm run dev
# atau
bun run dev
```

Server development akan berjalan di `http://localhost:8080`.

### Build Production

```sh
npm run build
# atau
bun run build
```

## Perintah yang Tersedia

| Perintah | Fungsi |
| --- | --- |
| `dev` | Menjalankan server development dengan HMR |
| `build` | Build aplikasi untuk production |
| `start` | Menjalankan build production (jika didukung lingkungan) |
| `lint` | Menjalankan ESLint |
| `format` | Memformat kode dengan Prettier |

## Struktur Direktori

```text
src/
  components/       # Komponen UI yang dapat digunakan ulang
  hooks/              # Custom React hooks
  integrations/       # Integrasi Supabase (client, admin, middleware, types)
  lib/                # Utility, fungsi data, dan helper hooks
  routes/             # File route TanStack Start
  styles.css          # Global styles & CSS variables
supabase/
  migrations/         # Migration SQL untuk skema dan RLS
public/               # Aset statis
```

## Catatan Keamanan

- Autentikasi admin dilakukan melalui Supabase Auth.
- Semua pengecekan role dan status dilakukan di sisi server melalui RLS dan function middleware.
- Client-side storage tidak digunakan untuk menyimpan role atau status approval.
- Service role key tidak di-*hardcode* dan tidak dikembalikan ke client.

## Lisensi

Proyek ini adalah kepemilikan internal. Silakan lihat file `LICENSE` (jika ada) untuk ketentuan penggunaan dan distribusi.

---

Dibangun menggunakan [Lovable](https://lovable.dev) + TanStack Start + Supabase.
