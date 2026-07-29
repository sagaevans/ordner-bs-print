import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { Navbar } from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/useAuth";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Login Admin - Ordner Akuntansi NasHKB" },
      {
        name: "description",
        content: "Masuk atau daftar sebagai admin untuk mengelola data ordner akuntansi NasHKB.",
      },
      { property: "og:title", content: "Login Admin - Ordner Akuntansi NasHKB" },
      {
        property: "og:description",
        content: "Masuk atau daftar sebagai admin untuk mengelola data ordner akuntansi.",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { session, profile, canEdit } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (canEdit) navigate({ to: "/admin", replace: true });
  }, [canEdit, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setMessage(null);

    if (mode === "signup") {
      const { error: err } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin },
      });
      setBusy(false);
      if (err) return setError(err.message);
      setMessage("Pendaftaran berhasil. Anda sudah bisa langsung login.");
      setMode("login");
      return;
    }

    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (err) return setError(err.message);
  };

  return (
    <div className="app">
      <Navbar />
      <main className="container">
        <header className="page-header">
          <h1 className="page-title">{mode === "login" ? "Login Admin" : "Daftar Admin Baru"}</h1>
        </header>

        {session && !canEdit && (
          <div className="detail-card">
            <h3 className="section-title">Menunggu verifikasi dari Owner</h3>
            <p style={{ color: "var(--text-muted)" }}>
              Akun <strong>{profile?.email ?? session.user.email}</strong> berstatus{" "}
              <strong>{profile?.status ?? "pending"}</strong>. Anda belum bisa mengakses Admin Panel
              sampai Owner menyetujui pendaftaran Anda.
            </p>
          </div>
        )}

        {!session && (
          <div className="detail-card" style={{ maxWidth: 480 }}>
            <form onSubmit={submit}>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  className="form-control"
                  value={email}
                  required
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  className="form-control"
                  value={password}
                  required
                  minLength={6}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {error && <p style={{ color: "var(--danger)", marginBottom: 10 }}>{error}</p>}
              {message && <p style={{ color: "var(--success)", marginBottom: 10 }}>{message}</p>}
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <button className="btn btn-primary" type="submit" disabled={busy}>
                  {busy ? "Memproses..." : mode === "login" ? "Masuk" : "Daftar"}
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => {
                    setMode(mode === "login" ? "signup" : "login");
                    setError(null);
                    setMessage(null);
                  }}
                >
                  {mode === "login" ? "Belum punya akun? Daftar" : "Sudah punya akun? Masuk"}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}