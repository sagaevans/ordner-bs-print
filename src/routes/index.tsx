import { useMemo, useState } from "react";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { Navbar } from "@/components/Navbar";
import { OrdnerFormModal } from "@/components/OrdnerFormModal";
import { StatusBadge } from "@/components/StatusBadge";
import { supabase } from "@/integrations/supabase/client";
import { LOGO_AKHLAK, LOGO_BUMN, LOGO_DANANTARA, LOGO_HK_BHIRAWA } from "@/lib/logos";
import { STATUS_BELUM, STATUS_SUDAH, fetchOrdner, type Ordner } from "@/lib/ordner";
import { useAuth } from "@/lib/useAuth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard - Daftar Ordner Akuntansi | NasHKB" },
      {
        name: "description",
        content:
          "Daftar ordner akuntansi PT HK Bhirawa Steel: cari, lihat detail, dan cetak label ordner.",
      },
      { property: "og:title", content: "Dashboard - Daftar Ordner Akuntansi | NasHKB" },
      {
        property: "og:description",
        content: "Daftar ordner akuntansi PT HK Bhirawa Steel: cari, lihat detail, dan cetak label ordner.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const navigate = useNavigate();
  const { canEdit } = useAuth();
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | typeof STATUS_SUDAH | typeof STATUS_BELUM>("all");
  const [jenisFilter, setJenisFilter] = useState<string>("all");
  const [tahunFilter, setTahunFilter] = useState<string>("all");
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Ordner | null>(null);

  const { data = [], refetch } = useQuery({ queryKey: ["ordner"], queryFn: fetchOrdner });

  const jenisOptions = useMemo(
    () => Array.from(new Set(data.map((o) => o.jenis).filter(Boolean))).sort((a, b) => a.localeCompare(b)),
    [data],
  );
  const tahunOptions = useMemo(
    () => Array.from(new Set(data.map((o) => String(o.tahun)).filter(Boolean))).sort((a, b) => Number(b) - Number(a)),
    [data],
  );

  const filtered = useMemo(() => {
    const k = keyword.toLowerCase().trim();
    return data.filter((item) => {
      const matchesKeyword =
        !k ||
        item.kode.toLowerCase().includes(k) ||
        item.jenis.toLowerCase().includes(k) ||
        String(item.no_urut).includes(k) ||
        String(item.tahun).includes(k);
      const matchesStatus = statusFilter === "all" || item.status === statusFilter;
      const matchesJenis = jenisFilter === "all" || item.jenis === jenisFilter;
      const matchesTahun = tahunFilter === "all" || String(item.tahun) === tahunFilter;
      return matchesKeyword && matchesStatus && matchesJenis && matchesTahun;
    });
  }, [data, keyword, statusFilter, jenisFilter, tahunFilter]);

  const totalOrdner = data.length;
  const totalDokumen = data.reduce((sum, item) => sum + (item.jumlah || 0), 0);

  const toggleSelection = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const handleDelete = async (item: Ordner) => {
    if (!window.confirm(`Hapus ordner "${item.kode}"?`)) return;
    const { error } = await supabase.from("ordner").delete().eq("id", item.id);
    if (error) window.alert(error.message);
    void refetch();
  };

  const toggleStatus = async (item: Ordner) => {
    const next = item.status === STATUS_SUDAH ? STATUS_BELUM : STATUS_SUDAH;
    const { error } = await supabase.from("ordner").update({ status: next }).eq("id", item.id);
    if (error) window.alert(error.message);
    void refetch();
  };

  return (
    <div className="app">
      <Navbar active="dashboard" />

      <main className="container">
        <header className="page-header">
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <img src={LOGO_HK_BHIRAWA} alt="Logo HK Bhirawa" style={{ height: 50 }} />
            <img
              src={LOGO_DANANTARA}
              alt="Logo Danantara"
              style={{ height: 35, objectFit: "contain" }}
            />
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <input
              type="text"
              className="form-control"
              placeholder="Cari Kode, Jenis, atau Tahun..."
              style={{ width: 250 }}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
            <select
              className="form-control"
              style={{ width: 170 }}
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as "all" | typeof STATUS_SUDAH | typeof STATUS_BELUM)
              }
            >
              <option value="all">Semua Status</option>
              <option value={STATUS_SUDAH}>{STATUS_SUDAH}</option>
              <option value={STATUS_BELUM}>{STATUS_BELUM}</option>
            </select>
            <select
              className="form-control"
              style={{ width: 200 }}
              value={jenisFilter}
              onChange={(e) => setJenisFilter(e.target.value)}
            >
              <option value="all">Semua Jenis</option>
              {jenisOptions.map((j) => (
                <option key={j} value={j}>
                  {j}
                </option>
              ))}
            </select>
            <select
              className="form-control"
              style={{ width: 140 }}
              value={tahunFilter}
              onChange={(e) => setTahunFilter(e.target.value)}
            >
              <option value="all">Semua Tahun</option>
              {tahunOptions.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <button className="btn btn-outline" onClick={() => setSelectMode(true)}>
              ☑ Pilih untuk Print
            </button>
            {canEdit && (
              <button
                className="btn btn-primary"
                onClick={() => {
                  setEditing(null);
                  setFormOpen(true);
                }}
              >
                Tambah Ordner
              </button>
            )}
          </div>
        </header>

        <div
          className="stats-container"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 20,
            marginBottom: 30,
          }}
        >
          <div className="stat-card">
            <div>
              <h3 style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginBottom: 10 }}>
                Total Ordner
              </h3>
              <p
                style={{
                  fontSize: "2rem",
                  fontWeight: "bold",
                  color: "var(--navy-primary)",
                  margin: 0,
                }}
              >
                {totalOrdner}
              </p>
            </div>
            <img src={LOGO_AKHLAK} alt="Logo AKHLAK" style={{ height: 55, objectFit: "contain" }} />
          </div>

          <div className="stat-card">
            <div>
              <h3 style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginBottom: 10 }}>
                Total Dokumen
              </h3>
              <p
                style={{
                  fontSize: "2rem",
                  fontWeight: "bold",
                  color: "var(--navy-primary)",
                  margin: 0,
                }}
              >
                {totalDokumen}
              </p>
            </div>
            <img src={LOGO_BUMN} alt="Logo BUMN" style={{ height: 140, objectFit: "contain" }} />
          </div>
        </div>

        <div className={`ordner-grid${selectMode ? " select-mode" : ""}`}>
          {filtered.length === 0 && (
            <p
              style={{
                gridColumn: "1 / -1",
                textAlign: "center",
                color: "var(--text-muted)",
                padding: "2rem",
              }}
            >
              Belum ada data ordner atau data tidak ditemukan.
            </p>
          )}

          {filtered.map((item) => (
            <div
              key={item.id}
              className={`ordner-card${selected.includes(item.id) ? " selected" : ""}`}
              onClick={() => {
                if (selectMode) toggleSelection(item.id);
                else navigate({ to: "/detail/$id", params: { id: item.id } });
              }}
            >
              <div
                className="card-checkbox-wrapper"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (selectMode) toggleSelection(item.id);
                }}
              >
                <input type="checkbox" readOnly checked={selected.includes(item.id)} />
                <label>Pilih untuk Print</label>
              </div>

              <div className="ordner-card-header">
                <span className="ordner-code">{item.kode || "-"}</span>
                <StatusBadge
                  status={item.status}
                  onToggle={canEdit ? () => void toggleStatus(item) : undefined}
                />
              </div>
              <div className="ordner-details">
                <p>
                  <span>No. Urut:</span> {item.no_urut}
                </p>
                <p>
                  <span>Jenis:</span> {item.jenis || "-"}
                </p>
                <p>
                  <span>Tahun:</span> {item.tahun || "-"}
                </p>
                <p>
                  <span>No. Dokumen:</span> {item.nomor_awal || "-"} s/d {item.nomor_akhir || "-"}
                </p>
                <p>
                  <span>Jumlah:</span> {item.jumlah || 0} Dokumen
                </p>
              </div>

              {canEdit && (
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    className="btn btn-outline"
                    style={{ padding: "0.4rem 0.9rem", fontSize: "0.8rem" }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setEditing(item);
                      setFormOpen(true);
                    }}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    className="btn btn-danger"
                    style={{ padding: "0.4rem 0.9rem", fontSize: "0.8rem" }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      void handleDelete(item);
                    }}
                  >
                    🗑️ Hapus
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>

      <div className={`bulk-action-panel${selectMode ? " show" : ""}`}>
        <span style={{ fontWeight: 600, color: "white" }}>{selected.length} Ordner Terpilih</span>
        <div style={{ display: "flex", gap: 10 }}>
          <Link
            to="/print"
            search={{ ids: selected.join(",") }}
            className="btn btn-gold"
            onClick={(e) => {
              if (selected.length === 0) {
                e.preventDefault();
                window.alert("Pilih minimal 1 Ordner untuk dicetak!");
              }
            }}
          >
            🖨️ Print Label
          </Link>
          <button
            className="btn btn-danger"
            onClick={() => {
              setSelectMode(false);
              setSelected([]);
            }}
          >
            Batal
          </button>
        </div>
      </div>

      {formOpen && (
        <OrdnerFormModal
          ordner={editing}
          onClose={() => setFormOpen(false)}
          onSaved={() => void refetch()}
        />
      )}
    </div>
  );
}
