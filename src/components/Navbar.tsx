import { Link, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { LOGO_NAS } from "@/lib/logos";
import { useAuth } from "@/lib/useAuth";

export function Navbar({ active }: { active?: "dashboard" | "admin" | "verifikasi" }) {
  const navigate = useNavigate();
  const { session, isOwner, canEdit } = useAuth();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  };

  return (
    <nav className="navbar no-print">
      <div className="container">
        <div className="brand" style={{ display: "flex", alignItems: "center" }}>
          <img
            src={LOGO_NAS}
            alt="Logo NAS"
            style={{ height: 35, marginRight: 10, objectFit: "contain" }}
          />
          Ordner Akuntansi
        </div>
        <div className="nav-links">
          <Link to="/" className={active === "dashboard" ? "active" : undefined}>
            Dashboard
          </Link>
          <Link to="/admin" className={active === "admin" ? "active" : undefined}>
            Admin Panel
          </Link>
          {isOwner && (
            <Link to="/verifikasi" className={active === "verifikasi" ? "active" : undefined}>
              Verifikasi User
            </Link>
          )}
          {session ? (
            <button type="button" className="navlink" onClick={handleSignOut}>
              Keluar{canEdit ? "" : " (pending)"}
            </button>
          ) : (
            <Link to="/auth">Login Admin</Link>
          )}
        </div>
      </div>
    </nav>
  );
}