import { useMemo, useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { Navbar } from "@/components/Navbar";
import { OrdnerFormModal } from "@/components/OrdnerFormModal";
import { StatusBadge } from "@/components/StatusBadge";
import { supabase } from "@/integrations/supabase/client";
import { STATUS_BELUM, STATUS_SUDAH, fetchOrdner, type Ordner } from "@/lib/ordner";
import { useAuth } from "@/lib/useAuth";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Panel - Manajemen Data Ordner | NasHKB" },
      {
        name: "description",
        content: "Kelola data ordner akuntansi: tambah, edit, hapus, dan ubah status cetak label.",
      },
      { property: "og:title", content: "Admin Panel - Manajemen Data Ordner | NasHKB" },
      {
        property: "og:description",
        content: "Kelola data ordner akuntansi: tambah, edit, hapus, dan ubah status cetak label.",
      },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const { session, profile, canEdit, loading } = useAuth();
  const [keyword, setKeyword] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Ordner | null>(null);

  const { data = [], refetch } = useQuery({ queryKey: ["ordner"], queryFn: fetchOrdner });

  const filtered = useMemo(() => {
    const k = keyword.toLowerCase().trim();
    if (!k) return data;
    return data.filter(
      (item) =>
        item.kode.toLowerCase().includes(k) ||
        item.jenis.toLowerCase().includes(k) ||
        String(item.no_urut).includes(k) ||
        String(item.tahun).includes(k),
    );
  }, [data, keyword]);

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

  if (!loading && !session) {
    return (
      <div className="app">
        <Navbar active="admin" />
        <main className="container">
          <div className="detail-card">
            <h3 className="section-title">Login diperlukan</h3>
            <p style={{ color: "var(--text-muted)", marginBottom: "1rem" }}>
              Silakan masuk sebagai admin untuk mengelola data ordner.
            </p>
            <Link to="/auth" className="btn btn-primary">
              Login Admin
            </Link>
          </div>
        </main>
      </div>
    );
  }

  if (!loading && session && !canEdit) {
    return (
      <div className="app">
        <Navbar active="admin" />
        <main className="container">
          <div className="detail-card">
            <h3 className="section-title">Menunggu verifikasi dari Owner</h3>
            <p style={{ color: "var(--text-muted)" }}>
              Akun <strong>{profile?.email ?? session.user.email}</strong> berstatus{" "}
              <strong>{profile?.status ?? "pending"}</strong>. Anda belum bisa mengakses Admin
              Panel.
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app">
      <Navbar active="admin" />
      <main className="container">
        <header className="page-header">
          <h1 className="page-title">Manajemen Data Ordner</h1>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <input
              type="text"
              className="form-control"
              placeholder="Cari data..."
              style={{ width: 250 }}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
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

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Kode</th>
                <th>No. Urut</th>
                <th>Jenis Dokumen</th>
                <th>Tahun</th>
                <th>No. Dokumen</th>
                <th>Jumlah</th>
                <th>Status</th>
                <th style={{ textAlign: "center" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id}>
                  <td>{item.kode}</td>
                  <td>{item.no_urut}</td>
                  <td>{item.jenis}</td>
                  <td>{item.tahun}</td>
                  <td>
                    {item.nomor_awal} s/d {item.nomor_akhir}
                  </td>
                  <td>{item.jumlah}</td>
                  <td>
                    <StatusBadge
                      status={item.status}
                      onToggle={canEdit ? () => void toggleStatus(item) : undefined}
                    />
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                      <Link
                        to="/detail/$id"
                        params={{ id: item.id }}
                        className="btn btn-outline"
                        style={{ padding: "0.35rem 0.8rem", fontSize: "0.8rem" }}
                      >
                        Detail
                      </Link>
                      {canEdit && (
                        <>
                          <button
                            className="btn btn-primary"
                            style={{ padding: "0.35rem 0.8rem", fontSize: "0.8rem" }}
                            onClick={() => {
                              setEditing(item);
                              setFormOpen(true);
                            }}
                          >
                            ✏️ Edit
                          </button>
                          <button
                            className="btn btn-danger"
                            style={{ padding: "0.35rem 0.8rem", fontSize: "0.8rem" }}
                            onClick={() => void handleDelete(item)}
                          >
                            🗑️ Hapus
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", color: "var(--text-muted)" }}>
                    Belum ada data ordner atau data tidak ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>

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