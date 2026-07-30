# Ordner Akuntansi

Ini adalah source code lengkap web app "Ordner Akuntansi - NasHKB" (HTML/CSS/JS statis dengan backend GitHub API). Tolong buatkan ulang sebagai project React di Lovable, dengan struktur, layout, style (navy & gold, Poppins font), dan semua halaman (Dashboard, Detail, Print Label, Admin Panel) PERSIS seperti di source code ini — termasuk ukuran, warna, dan tata letak label print yang ada di print.html/print.js, jangan diubah sedikit pun.

Gunakan semua file logo yang ada di folder pic/ (logo NAS, Danantara, BUMN, dll) persis sesuai posisi dan ukurannya di source code aslinya — jangan diganti placeholder. Logo eksternal yang sudah pakai link (HK Bhirawa di navbar/header dashboard/label print, AKHLAK di kartu statistik) tetap pakai link aslinya, jangan diubah.

Ada 3 perubahan yang perlu dilakukan:

1. GANTI SISTEM PENYIMPANAN & LOGIN:

   - Ganti dari GitHub API + localStorage token ke Supabase (pakai integrasi Supabase bawaan Lovable / Connect Supabase, tidak perlu saya setup manual).

   - Admin login pakai Supabase Auth dengan sign up email + password biasa (bukan token).

   - Nonaktifkan verifikasi email otomatis dari Supabase (email confirmation OFF) — user tidak perlu klik link konfirmasi di email untuk bisa login. Setelah daftar, user bisa langsung login.

   - Namun begitu login, akun berstatus "pending" dan belum bisa akses Admin Panel (tampilkan pesan "Menunggu verifikasi dari Owner"). Verifikasi ini dilakukan MANUAL oleh saya sebagai Owner, bukan lewat email.

   - Saya (Owner) punya akun dengan role "owner", bisa akses halaman "Verifikasi User" berisi daftar pendaftar baru dengan tombol Approve/Reject.

   - Begitu di-approve, user langsung jadi "admin" penuh — TIDAK ADA tingkatan role lain. Semua admin approved punya akses SAMA PERSIS dengan Owner untuk data ordner: bisa tambah, edit, hapus semua data ordner tanpa batasan.

   - Buat tabel `profiles` (user_id, email, role: 'owner'|'admin', status: 'pending'|'approved'|'rejected') dan terapkan Row Level Security: hanya user status 'approved' (baik role owner maupun admin) yang boleh insert/update/delete tabel ordner; hanya role 'owner' yang boleh update tabel profiles.

   - PENTING: pastikan tombol "Tambah Ordner" (di Admin Panel) serta tombol/ikon Edit dan Hapus pada setiap baris/kartu ordner TETAP TAMPIL dan berfungsi penuh untuk semua user berstatus approved (baik role admin maupun owner) — jangan sampai tombol-tombol ini hilang, tersembunyi, atau ke-disable karena logika role/permission. Cek ulang kondisi render tombol-tombol ini agar konsisten dengan aturan akses di atas.

   - Dashboard (index) tetap bisa diakses publik tanpa login untuk lihat daftar ordner (read-only); tombol tambah/edit/hapus hanya muncul saat login sebagai admin/owner approved — tapi begitu approved, tombol itu wajib muncul di Dashboard maupun Admin Panel.

2. GANTI ISTILAH STATUS + BISA DIEDIT MANUAL:

   - Field "status" pada data ordner (sebelumnya "Aktif"/"Inaktif") diganti jadi "Sudah Print" dan "Belum Print" di SEMUA tempat: form tambah/edit, badge warna di kartu dashboard, filter, kolom tabel Admin Panel, dan halaman Detail Ordner.

   - Di halaman Detail Ordner dan Admin Panel, badge status ini harus BISA DIKLIK LANGSUNG untuk toggle/ubah antara "Sudah Print" dan "Belum Print" — tapi HANYA muncul sebagai elemen yang bisa diklik/diedit kalau user sudah login sebagai admin/owner approved. Kalau belum login, tampil sebagai badge biasa (read-only, tidak bisa diklik). Setiap perubahan status langsung tersimpan ke database Supabase.

3. WARNA TOMBOL "PRINT LABEL":

   - Di halaman Detail Ordner, tombol "Print Label" saat ini berwarna solid (navy/gold). Ubah warnanya jadi PUTIH dengan border, persis sama seperti style tombol "← Kembali" di sebelahnya (outline/putih, bukan warna solid).

Semua field data ordner lainnya (kode, noUrut, jenis, singkatan, warnaJenis, tahun, nomorAwal, nomorAkhir, jumlah, keterangan, dokumen) tetap sama seperti di source code.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://ordner-bs-print.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/933663a0-6a19-4d01-95ec-76910338f9dd).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
