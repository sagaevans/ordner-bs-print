import { Link, createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { Navbar } from "@/components/Navbar";
import { StatusBadge } from "@/components/StatusBadge";
import { supabase } from "@/integrations/supabase/client";
import { STATUS_BELUM, STATUS_SUDAH, fetchOrdnerById, formatDate } from "@/lib/ordner";
import { useAuth } from "@/lib/useAuth";

export const Route = createFileRoute("/detail/$id")({
  head: () => ({
    meta: [
      { title: "Detail Ordner - Ordner Akuntansi NasHKB" },
      {
        name: "description",
        content: "Rincian data ordner akuntansi: jenis dokumen, tahun, rentang nomor, dan status.",
      },
      { property: "og:title", content: "Detail Ordner - Ordner Akuntansi NasHKB" },
      {
        property: "og:description",
        content: "Rincian data ordner akuntansi: jenis dokumen, tahun, rentang nomor, dan status.",
      },
    ],
  }),
  component: DetailPage,
});

function DetailPage() {
  const { id } = Route.useParams();
  const { canEdit } = useAuth();
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["ordner", id],
    queryFn: () => fetchOrdnerById(id),
  });

  const toggleStatus = async () => {
    if (!data) return;
    const next = data.status === STATUS_SUDAH ? STATUS_BELUM : STATUS_SUDAH;
    const { error } = await supabase.from("ordner").update({ status: next }).eq("id", data.id);
    if (error) window.alert(error.message);
    void refetch();
  };

  return (
    <div className="app">
      <Navbar />
      <main className="container">
        {isLoading && <p style={{ color: "var(--text-muted)" }}>Memuat Data...</p>}

        {!isLoading && !data && (
          <div style={{ textAlign: "center", padding: "3rem 0" }}>
            <h2 style={{ color: "var(--danger)", marginBottom: "1rem" }}>
              Data Ordner Tidak Ditemukan!
            </h2>
            <Link to="/" className="btn btn-primary">
              Kembali ke Dashboard
            </Link>
          </div>
        )}

        {data && (
          <>
            <header className="page-header">
              <div>
                <h1 className="page-title">{data.kode || "-"}</h1>
                <span style={{ marginTop: 5, display: "inline-block" }}>
                  <StatusBadge
                    status={data.status}
                    onToggle={canEdit ? () => void toggleStatus() : undefined}
                  />
                </span>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <Link to="/print" search={{ ids: data.id }} className="btn btn-outline">
                  🖨️ Print Label
                </Link>
                <Link to="/" className="btn btn-outline">
                  ← Kembali
                </Link>
              </div>
            </header>

            <section className="detail-card">
              <h3 className="section-title">Informasi Umum</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <p>Jenis Dokumen</p>
                  <h4>{data.jenis || "-"}</h4>
                </div>
                <div className="detail-item">
                  <p>Singkatan</p>
                  <h4>{data.singkatan || "-"}</h4>
                </div>
                <div className="detail-item">
                  <p>Tahun</p>
                  <h4>{data.tahun || "-"}</h4>
                </div>
                <div className="detail-item">
                  <p>Rentang Nomor Dokumen</p>
                  <h4>
                    {data.nomor_awal || "-"} s/d {data.nomor_akhir || "-"}
                  </h4>
                </div>
                <div className="detail-item">
                  <p>Total Jumlah Dokumen</p>
                  <h4>{data.jumlah || 0} Dokumen</h4>
                </div>
                <div className="detail-item">
                  <p>Keterangan Tambahan</p>
                  <h4>{data.keterangan || "-"}</h4>
                </div>
              </div>
            </section>

            <section>
              <h3 className="section-title">Daftar Dokumen dalam Ordner</h3>
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th style={{ width: 50 }}>No</th>
                      <th>Nomor Dokumen</th>
                      <th>Tanggal</th>
                      <th>Uraian / Keterangan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.isArray(data.dokumen) && data.dokumen.length > 0 ? (
                      data.dokumen.map((doc, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td>{doc.nomor || "-"}</td>
                          <td>{doc.tanggal ? formatDate(doc.tanggal) : "-"}</td>
                          <td>{doc.uraian || "-"}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} style={{ textAlign: "center", color: "var(--text-muted)" }}>
                          Belum ada rincian dokumen yang ditambahkan.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}