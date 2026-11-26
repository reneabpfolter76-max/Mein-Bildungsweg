import { redirect } from "next/navigation";
import { getIdentity } from "@/lib/auth/session";
import { SIMULATED_PROFILES } from "@/lib/data/profiles";
import LoginForm from "@/components/LoginForm";
import { setupStatus } from "@/lib/config";

export const dynamic = "force-dynamic";

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
        <details className="card small" style={{ marginTop: 16 }}>
          <summary>Einrichtung prüfen (für Administration)</summary>
          <p className="muted">Zeigt nur, ob die Einstellungen in Vercel gefunden wurden – keine Werte.</p>
          <ul style={{ listStyle: "none", paddingLeft: 0 }}>
            {setupStatus().map((s) => (
              <li key={s.name} style={{ marginBottom: 6 }}>
                {s.set ? "✅" : "⚪️"} <code>{s.name}</code>
                <div className="muted">{s.set ? "gefunden" : `nicht gesetzt – ${s.hint}`}</div>
              </li>
            ))}
          </ul>
        </details>
      </div>
    </>
  );
}
