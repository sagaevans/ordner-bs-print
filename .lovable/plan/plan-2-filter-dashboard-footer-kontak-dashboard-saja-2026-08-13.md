# Plan: 2 Filter Dashboard + Footer Kontak (Dashboard saja)

Hanya mengubah `src/routes/index.tsx` (filter + footer) dan menambah sedikit CSS di `src/styles.css`. Tidak menyentuh fungsi lain.

## 1. Dua filter dropdown baru di Dashboard

Sudah ada 2 filter: pencarian teks + status. Tambah 2 dropdown sederhana (sama gaya dengan dropdown Status) agar total 4 filter terpisah:

- **Jenis Dokumen** — `<select>` berisi nilai unik `item.jenis` (urut A→Z). Opsi pertama "Semua Jenis".
- **Tahun** — `<select>` berisi nilai unik `String(item.tahun)` (urut besar→kecil). Opsi pertama "Semua Tahun".

State baru:
```ts
const [jenisFilter, setJenisFilter] = useState<string>("all");
const [tahunFilter, setTahunFilter] = useState<string>("all");
```

Opsi dihitung pakai `useMemo` dari `data`. Logika `filtered` menambah:
```ts
const matchesJenis = jenisFilter === "all" || item.jenis === jenisFilter;
const matchesTahun = tahunFilter === "all" || String(item.tahun) === tahunFilter;
return matchesKeyword && matchesStatus && matchesJenis && matchesTahun;
```

Urutan di header: teks → status → jenis dokumen → tahun. `flexWrap: wrap` sudah ada.

## 2. Footer kontak developer (Dashboard saja)

Elemen baru setelah `</main>`, di dalam `div.app`, sebelum `bulk-action-panel`. Class `no-print`.

- "nasz — nasotp7@gmail.com" (mailto link, warna gold)
- "Dibuat dengan Lovable — lovable.dev" (link https://lovable.dev, warna gold)
- Background navy-deep, teks putih, centered.

CSS baru di `src/styles.css`:
```css
.app-footer { background: var(--navy-deep); color: #fff; padding: 1.75rem 1rem; margin-top: 2rem; text-align: center; font-size: 0.85rem; }
.app-footer a { color: var(--gold-primary); font-weight: 600; text-decoration: none; }
.app-footer a:hover { text-decoration: underline; }
```

## Tidak diubah
Tidak ada perubahan pada: logika auth/role, tombol tambah/edit/hapus, toggle status, print, admin panel, verifikasi, detail, atau fungsi lainnya.
