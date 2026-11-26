import { redirect } from "next/navigation";
import { getIdentity } from "@/lib/auth/session";
import { SIMULATED_PROFILES } from "@/lib/data/profiles";
import LoginForm from "@/components/LoginForm";

export default async function LoginPage() {
  if (await getIdentity()) redirect("/");
  const profiles = SIMULATED_PROFILES.map((p) => ({ id: p.id, name: p.displayName, description: p.description }));
  return (
    <>
      <div className="topbar">
        <span className="brand">WIFI Bildungsnavigator</span>
        <span className="pill">Interner Pilot</span>
      </div>
      <div className="banner">Simuliertes myWIFI-Login · ausschließlich fiktive Daten verwenden · keine echten Buchungen</div>
      <div className="center">
        <div className="card">
          <h2 style={{ marginTop: 0 }}>Anmelden</h2>
          <p className="muted small">
            Der Bildungsnavigator ist für alle in myWIFI registrierten Personen kostenlos. Im Pilot ersetzt diese Seite das
            myWIFI-Login: Testpersonen-ID, Zugangscode und ein fiktives Profil.
          </p>
          <LoginForm profiles={profiles} />
        </div>
      </div>
    </>
  );
}
