import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { STATUS_BELUM, STATUS_SUDAH, type Ordner } from "@/lib/ordner";

export type OrdnerDraft = {
  kode: string;
  no_urut: number;
  tahun: number;
  jenis: string;
  singkatan: string;
  nomor_awal: string;
  nomor_akhir: string;
  jumlah: number;
  status: string;
  warna_jenis: string;
  keterangan: string;
};

const empty: OrdnerDraft = {
  kode: "",
  no_urut: 1,
  tahun: new Date().getFullYear(),
  jenis: "",
  singkatan: "",
  nomor_awal: "",
  nomor_akhir: "",
  jumlah: 0,
  status: STATUS_BELUM,
  warna_jenis: "#FF8C00",
  keterangan: "",
};

export function OrdnerFormModal({
  ordner,
  onClose,
  onSaved,
}: {
  ordner: Ordner | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<OrdnerDraft>(
    ordner
      ? {
          kode: ordner.kode,
          no_urut: ordner.no_urut,
          tahun: ordner.tahun,
          jenis: ordner.jenis,
          singkatan: ordner.singkatan,
          nomor_awal: ordner.nomor_awal,
          nomor_akhir: ordner.nomor_akhir,
          jumlah: ordner.jumlah,
          status: ordner.status,
          warna_jenis: ordner.warna_jenis,
          keterangan: ordner.keterangan,
        }
      : empty,
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof OrdnerDraft>(key: K, value: OrdnerDraft[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    const payload = { ...form };
    const { error: err } = ordner
      ? await supabase.from("ordner").update(payload).eq("id", ordner.id)
      : await supabase.from("ordner").insert(payload);
    setSaving(false);
    if (err) {
      setError(err.message);
      return;
    }
    onSaved();
    onClose();
  };

  return (
    <div className="modal" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{ordner ? "Edit Ordner" : "Tambah Ordner Baru"}</h2>
          <button className="close-btn" onClick={onClose} aria-label="Tutup">
            &times;
          </button>
        </div>
        <div className="modal-body">
          <div className="form-row">
            <div className="form-group">
              <label>Kode Ordner</label>
              <input
                className="form-control"
                value={form.kode}
                placeholder="Misal: BKK-2026-01"
                onChange={(e) => set("kode", e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Nomor Urut / Volume</label>
              <input
                type="number"
                className="form-control"
                value={form.no_urut}
                onChange={(e) => set("no_urut", Number(e.target.value))}
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Tahun</label>
              <input
                type="number"
                className="form-control"
                value={form.tahun}
                onChange={(e) => set("tahun", Number(e.target.value))}
              />
            </div>
            <div className="form-group">
              <label>Jenis Dokumen</label>
              <input
                className="form-control"
                value={form.jenis}
                placeholder="Misal: Bukti Kas Keluar"
                onChange={(e) => set("jenis", e.target.value)}
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Singkatan</label>
              <input
                className="form-control"
                value={form.singkatan}
                placeholder="Misal: BKK"
                onChange={(e) => set("singkatan", e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Nomor Dokumen Awal</label>
              <input
                className="form-control"
                value={form.nomor_awal}
                placeholder="Misal: 15...0000"
                onChange={(e) => set("nomor_awal", e.target.value)}
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Nomor Dokumen Akhir</label>
              <input
                className="form-control"
                value={form.nomor_akhir}
                placeholder="Misal: 15...0036"
                onChange={(e) => set("nomor_akhir", e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Jumlah Dokumen</label>
              <input
                type="number"
                className="form-control"
                value={form.jumlah}
                onChange={(e) => set("jumlah", Number(e.target.value))}
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group" style={{ gridColumn: "span 2" }}>
              <label>Status</label>
              <select
                className="form-control"
                value={form.status}
                onChange={(e) => set("status", e.target.value)}
              >
                <option value={STATUS_SUDAH}>{STATUS_SUDAH}</option>
                <option value={STATUS_BELUM}>{STATUS_BELUM}</option>
              </select>
            </div>
            <div className="form-group">
              <label>Warna Label (Jenis &amp; Singkatan)</label>
              <input
                type="color"
                className="form-control"
                value={form.warna_jenis}
                style={{ height: 42, padding: 2, cursor: "pointer", width: "100%" }}
                onChange={(e) => set("warna_jenis", e.target.value)}
              />
            </div>
          </div>
          <div className="form-group">
            <label>Keterangan Tambahan</label>
            <input
              className="form-control"
              value={form.keterangan}
              placeholder="Informasi tambahan (opsional)"
              onChange={(e) => set("keterangan", e.target.value)}
            />
          </div>
          {error && <p style={{ color: "var(--danger)", fontWeight: 500 }}>{error}</p>}
        </div>
        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>
            Batal
          </button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? "Menyimpan..." : "Simpan Data"}
          </button>
        </div>
      </div>
    </div>
  );
}