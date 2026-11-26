import { redirect } from "next/navigation";
import { getIdentity } from "@/lib/auth/session";
import { durationMinutes, effectiveStatus } from "@/lib/cases";
import { config, isDemoMode } from "@/lib/config";
import { computeStats } from "@/lib/stats";
import { getStore, storageBackend } from "@/lib/store";
import { RATING_LABELS, type Ratings } from "@/lib/types";
import AdminSettings from "@/components/AdminSettings";

export const dynamic = "force-dynamic";

function Kpi({ v, l }: { v: string | number; l: string }) {
  return (
    <div className="card kpi">
      <div className="v">{v}</div>
      <div className="l">{l}</div>
    </div>
  );
}

const eur = (n: number) => n.toLocaleString("de-AT", { style: "currency", currency: "EUR", maximumFractionDigits: 2 });

export default async function AdminPage() {
  const identity = await getIdentity();
  if (!identity) redirect("/login");
  if (identity.role !== "admin") redirect("/");

  const store = getStore();
  const [cases, settings] = await Promise.all([store.listCases(), store.getSettings()]);
  const s = computeStats(cases);
  const maxLevel = Math.max(1, s.byLevel.L1, s.byLevel.L2, s.byLevel.L3, s.byLevel.ohne);

  return (
    <>
      <div className="topbar">
        <div>
          <span className="brand">WIFI Bildungsnavigator</span>
          <span className="pill">Administration</span>
        </div>
        <div className="row small">
          <span className="muted">
            Speicher: {storageBackend()} · Modell: {isDemoMode() ? "Demo ohne KI" : config.openaiModel}
          </span>
          <a href="/">Zum Chat</a>
          <a href="/api/admin/export">
            <button className="primary">Excel-Export</button>
          </a>
        </div>
      </div>
      <div className="admin">
        <div className="kpis">
          <Kpi v={s.total} l="Beratungsfälle" />
          <Kpi v={s.testers} l="Testpersonen" />
          <Kpi v={`${s.completionRate} %`} l="Abschlussquote (inkl. Übergabe)" />
          <Kpi v={`${s.abandonRate} %`} l="Abbruchquote" />
          <Kpi v={`${s.handoverRate} %`} l="Weiterleitungsquote" />
          <Kpi v={`${s.avgDurationMin} min`} l="Ø Dauer" />
          <Kpi v={s.avgOverallRating ?? "–"} l="Ø Bewertung (1–5)" />
          <Kpi v={s.simulatedBookings} l="Simulierte Buchungen (tatsächlich: 0)" />
          <Kpi v={eur(s.monthCostEur)} l={`KI-Kosten Monat (Grenze ${eur(settings.monthlyBudgetEur)})`} />
        </div>

        <div className="grid2">
          <div className="card">
            <h3 style={{ marginTop: 0 }}>Levelverteilung</h3>
            {(["L1", "L2", "L3", "ohne"] as const).map((l) => (
              <div key={l} style={{ marginBottom: 6 }}>
                <div className="small">
                  {l === "ohne" ? "ohne Level" : l}: {s.byLevel[l]}
                </div>
                <div className="bar" style={{ width: `${(s.byLevel[l] / maxLevel) * 100}%`, opacity: l === "ohne" ? 0.35 : 1 }} />
              </div>
            ))}
            <p className="small muted">Fälle mit Levelwechsel: {s.levelChangeCases}</p>
          </div>
          <div className="card">
            <h3 style={{ marginTop: 0 }}>Qualität (Ø je Kriterium)</h3>
            {Object.keys(s.avgRatings).length === 0 && <p className="muted small">Noch keine Bewertungen.</p>}
            {(Object.entries(s.avgRatings) as [keyof Ratings, number][]).map(([k, v]) => (
              <div className="rating" key={k}>
                <span>{RATING_LABELS[k]}</span>
                <strong>{v}</strong>
              </div>
            ))}
            <p className="small muted">
              Kundenfreigabe: ja {s.releases.ja ?? 0} · nach Überarbeitung {s.releases.nach_ueberarbeitung ?? 0} · nein {s.releases.nein ?? 0}
            </p>
          </div>
          <div className="card">
            <h3 style={{ marginTop: 0 }}>Nachgefragte Themen</h3>
            {s.topTopics.length === 0 && <p className="muted small">Noch keine Daten.</p>}
            <ol className="small">
              {s.topTopics.map(([t, n]) => (
                <li key={t}>
                  {t} ({n})
                </li>
              ))}
            </ol>
          </div>
          <div className="card">
            <h3 style={{ marginTop: 0 }}>Nicht abgedeckter Bildungsbedarf</h3>
            {s.uncoveredNeeds.length === 0 && <p className="muted small">Noch keine Einträge.</p>}
            <ul className="small">
              {s.uncoveredNeeds.map((n, i) => (
                <li key={i}>{n}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="card" style={{ marginBottom: 20 }}>
          <h3 style={{ marginTop: 0 }}>Fair-Use und Kostenkontrolle</h3>
          <p className="small muted">
            Kostenlose Nutzung für alle angemeldeten Personen – geschützt durch ein Tageslimit pro Person und eine monatliche
            Kostenobergrenze (Schätzung auf Basis der Preisannahmen in den Umgebungsvariablen).
          </p>
          <AdminSettings initial={settings} />
        </div>

        <h3>Fälle</h3>
        <table className="t">
          <thead>
            <tr>
              <th>Fall-ID</th>
              <th>Testperson</th>
              <th>Beginn</th>
              <th>Dauer</th>
              <th>Status</th>
              <th>Level</th>
              <th>Thema</th>
              <th>Übergabe</th>
              <th>Bewertung</th>
              <th>Kosten</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {cases.map((c) => {
              const avg = c.ratings ? Object.values(c.ratings).reduce((a, b) => a + b, 0) / 8 : null;
              return (
                <tr key={c.id}>
                  <td>{c.id}</td>
                  <td>{c.testerId}</td>
                  <td>{new Date(c.startedAt).toLocaleString("de-AT", { dateStyle: "short", timeStyle: "short" })}</td>
                  <td>{durationMinutes(c)} min</td>
                  <td>{effectiveStatus(c)}</td>
                  <td>
                    {c.entryLevel ?? "–"}
                    {c.finalLevel && c.finalLevel !== c.entryLevel ? ` → ${c.finalLevel}` : ""}
                  </td>
                  <td>{c.topic ?? "–"}</td>
                  <td>{c.handover ? c.handover.target : "–"}</td>
                  <td>{avg ? avg.toFixed(1) : "–"}</td>
                  <td>{eur(c.costEur)}</td>
                  <td>
                    <a href={`/api/cases/${c.id}/report`}>Bericht</a>
                  </td>
                </tr>
              );
            })}
            {cases.length === 0 && (
              <tr>
                <td colSpan={11} className="muted">
                  Noch keine Fälle.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
