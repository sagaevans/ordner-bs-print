# Plan: Tambah 2 Filter Dashboard + Footer Kontak Developer

## 1. Dua filter baru di Dashboard (dropdown sederhana)

File: `src/routes/index.tsx`

Sudah ada 2 filter: pencarian teks (`keyword`) + status (`statusFilter`). Tambah 2 filter baru agar total 4:

- **Jenis Dokumen** (`jenisFilter`) — dropdown `<select>` berisi nilai unik dari `data.map(o => o.jenis)` (diurutkan, dibuang duplikat). Opsi pertama "Semua Jenis", lalu tiap nilai jenis.
- **Tahun** (`tahunFilter`) — dropdown `<select>` berisi nilai unik dari `data.map(o => String(o.tahun))` (diurutkan descending). Opsi pertama "Semua Tahun", lalu tiap tahun.

State baru:
```ts
const [jenisFilter, setJenisFilter] = useState<string>("all");
const [tahunFilter, setTahunFilter] = useState<string>("all");
```

Nilai unik dihitung pakai `useMemo` dari `data` agar tetap reaktif terhadap perubahan data:
```ts
const jenisOptions = useMemo(
  () => Array.from(new Set(data.map((o) => o.jenis).filter(Boolean))).sort((a, b) => a.localeCompare(b)),
  [data]
);
const tahunOptions = useMemo(
  () => Array.from(new Set(data.map((o) => String(o.tahun)).filter(Boolean))).sort((a, b) => Number(b) - Number(a)),
  [data]
);
```

`filtered` diperbarui menambahkan kondisi:
```ts
const matchesJenis = jenisFilter === "all" || item.jenis === jenisFilter;
const matchesTahun = tahunFilter === "all" || String(item.tahun) === tahunFilter;
return matchesKeyword && matchesStatus && matchesJenis && matchesTahun;
```

Tata letak: keempat kontrol filter tetap di dalam `<header className="page-header">` div kanan, `flexWrap: wrap` agar otomatis pindah baris. Dropdown Jenis Dokumen lebar ~200px, Tahun lebar ~140px, diletakkan setelah dropdown Status (urutan: teks → status → jenis → tahun).

Tidak ada perubahan di file lain untuk bagian filter.

## 2. Footer kontak developer (Dashboard saja)

Tambah elemen footer baru di `src/routes/index.tsx`, setelah `</main>` dan sebelum `<div className="bulk-action-panel">` (atau setelahnya — di luar `<main>`, tetap di dalam `div.app`).

Konten footer:
- Judul kecil: "Kontak Developer"
- Baris 1 (developer / user): "nasz — nasotp7@gmail.com" (email sebagai `mailto:` link)
- Baris 2 (Lovable): "Dibuat dengan Lovable — lovable.dev" (link `https://lovable.dev`)

Gaya: pakai token warna yang sudah ada, `no-print` agar tidak ikut tercetak. Background navy (`--navy-deep`), teks putih, email & link Lovable berwarna gold (`--gold-primary`). Layout flex column, centered, padding atas-bawah ~2rem.

Tambah class CSS baru di `src/styles.css`:
```css
.app-footer {
  background: var(--navy-deep);
  color: var(--white, #fff);
  padding: 1.75rem 1rem;
  margin-top: 2rem;
  text-align: center;
  font-size: 0.85rem;
}
.app-footer h4 { font-size: 0.8rem; letter-spacing: 0.5px; text-transform: uppercase; color: var(--gold-primary); margin: 0 0 0.5rem; }
.app-footer p { margin: 0.25rem 0; }
.app-footer a { color: var(--gold-primary); text-decoration: none; font-weight: 600; }
.app-footer a:hover { text-decoration: underline; }
```

Hanya muncul di Dashboard (index), tidak di halaman lain.

## 3. Verifikasi

- Build/typecheck lewat otomatis.
- Pastikan 4 filter bekerja bersamaan (AND logic).
- Pastikan footer tidak ikut tercetak saat print label (class `no-print`).
