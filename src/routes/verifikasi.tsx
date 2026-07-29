import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { Navbar } from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, type Profile } from "@/lib/useAuth";

export const Route = createFileRoute("/verifikasi")({
  head: () => ({
    meta: [
      { title: "Verifikasi User - Ordner Akuntansi NasHKB" },
      {
        name: "description",
        content: "Halaman Owner untuk menyetujui atau menolak pendaftar admin baru.",
      },
      { property: "og:title", content: "Verifikasi User - Ordner Akuntansi NasHKB" },
      {
        property: "og:description",
        content: "Halaman Owner untuk menyetujui atau menolak pendaftar admin baru.",
      },
    ],
  }),
  component: VerifikasiPage,
});

async function fetchProfiles(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Profile[];
}

function VerifikasiPage() {
  const { isOwner, loading } = useAuth();
  const { data = [], refetch } = useQuery({
    queryKey: ["profiles"],
    queryFn: fetchProfiles,
    enabled: isOwner,
  });

  const setStatus = async (id: string, status: "approved" | "rejected") => {
    const { error } = await supabase.from("profiles").update({ status }).eq("id", id);
    if (error) window.alert(error.message);
    void refetch();
  };

  if (!loading && !isOwner) {
    return (
      <div className="app">
        <Navbar active="verifikasi" />
        <main className="container">
          <div className="detail-card">
            <h3 className="section-title">Akses ditolak</h3>
            <p style={{ color: "var(--text-muted)" }}>
              Halaman ini hanya dapat diakses oleh Owner.
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app">
      <Navbar active="verifikasi" />
      <main className="container">
        <header className="page-header">
          <h1 className="page-title">Verifikasi User</h1>
        </header>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th style={{ textAlign: "center" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {data.map((p) => (
                <tr key={p.id}>
                  <td>{p.email}</td>
                  <td style={{ textTransform: "uppercase" }}>{p.role}</td>
                  <td>
                    <span
                      className={`badge ${p.status === "approved" ? "badge-active" : "badge-inactive"}`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td style={{ textAlign: "center" }}>
                    {p.role === "owner" ? (
                      <span style={{ color: "var(--text-muted)" }}>-</span>
                    ) : (
                      <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                        <button
                          className="btn btn-primary"
                          style={{ padding: "0.35rem 0.8rem", fontSize: "0.8rem" }}
                          disabled={p.status === "approved"}
                          onClick={() => void setStatus(p.id, "approved")}
                        >
                          Approve
                        </button>
                        <button
                          className="btn btn-danger"
                          style={{ padding: "0.35rem 0.8rem", fontSize: "0.8rem" }}
                          disabled={p.status === "rejected"}
                          onClick={() => void setStatus(p.id, "rejected")}
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ textAlign: "center", color: "var(--text-muted)" }}>
                    Belum ada pendaftar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}