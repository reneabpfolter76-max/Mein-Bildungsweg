"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import RichText from "@/components/RichText";
import FeedbackForm from "@/components/FeedbackForm";
import type { Case, Message } from "@/lib/types";

interface CaseSummary {
  id: string;
  startedAt: string;
  topic?: string;
  level?: string;
  status: string;
}

interface Props {
  userId: string;
  isAdmin: boolean;
  profileName: string;
  demoMode: boolean;
  tempStorage: boolean;
}

const LEVEL_NAMES: Record<string, string> = { L1: "Kursinformation", L2: "Fachberatung", L3: "Bildungsorientierung" };

export default function Chat({ userId, isAdmin, profileName, demoMode, tempStorage }: Props) {
  const [cases, setCases] = useState<CaseSummary[]>([]);
  const [active, setActive] = useState<Case | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const bottom = useRef<HTMLDivElement>(null);

  const loadCases = useCallback(async () => {
    const res = await fetch("/api/cases");
    if (res.status === 401) return void (window.location.href = "/login");
    const data = await res.json();
    setCases(data.cases ?? []);
  }, []);

  useEffect(() => {
    loadCases();
  }, [loadCases]);

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, busy]);

  async function openCase(id: string) {
    setError("");
    const res = await fetch(`/api/cases/${id}`);
    if (!res.ok) return setError("Fall konnte nicht geladen werden.");
    const data = await res.json();
    setActive(data.case);
    setMessages(data.messages);
  }

  function newCase() {
    setActive(null);
    setMessages([]);
    setError("");
  }

  async function send(e?: React.FormEvent) {
    e?.preventDefault();
    const text = input.trim();
    if (!text || busy) return;
    setBusy(true);
    setError("");
    setInput("");
    const optimistic: Message = { id: "tmp", caseId: active?.id ?? "", testerId: userId, role: "user", content: text, createdAt: new Date().toISOString() };
    setMessages((m) => [...m, optimistic]);
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ caseId: active?.id, message: text }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setMessages((m) => m.filter((x) => x !== optimistic));
      setInput(text);
      return setError(data.error ?? "Senden fehlgeschlagen.");
    }
    setActive(data.case);
    setMessages((m) => [...m.filter((x) => x !== optimistic), ...data.messages]);
    loadCases();
  }

  async function setStatus(status: "abgeschlossen" | "abgebrochen") {
    if (!active) return;
    const res = await fetch(`/api/cases/${active.id}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      setActive((await res.json()).case);
      loadCases();
    }
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  const closed = active && active.status !== "offen";

  return (
    <>
      <div className="topbar">
        <div>
          <span className="brand">WIFI Bildungsnavigator</span>
          <span className="pill">Interner Pilot</span>
          {demoMode && <span className="pill grey">Demo-Modus ohne KI</span>}
        </div>
        <div className="row small">
          <span className="muted">
            {userId} · {profileName}
          </span>
          {isAdmin && <a href="/admin">Admin-Dashboard</a>}
          <button onClick={logout}>Abmelden</button>
        </div>
      </div>
      <div className="banner">
        Sie sprechen mit einer KI. Auskünfte sind unverbindlich. Fiktive Kurs- und Kundendaten, Buchungen sind simuliert.
        {tempStorage && " Testbetrieb: Fälle werden nur vorübergehend gespeichert."}
      </div>
      <div className="layout">
        <aside className="sidebar">
          <button className="primary" style={{ width: "100%" }} onClick={newCase}>
            + Neuer Beratungsfall
          </button>
          <ul className="caselist">
            {cases.map((c) => (
              <li key={c.id} className={active?.id === c.id ? "active" : ""} onClick={() => openCase(c.id)}>
                <div className="small">
                  <strong>{c.id}</strong>
                </div>
                <div className="small">{c.topic ?? "ohne Thema"}</div>
                <div className="small muted">
                  {c.level ?? "–"} · {c.status} · {new Date(c.startedAt).toLocaleDateString("de-AT")}
                </div>
              </li>
            ))}
            {cases.length === 0 && <li className="muted small">Noch keine Fälle.</li>}
          </ul>
        </aside>

        <main className="chat">
          <div className="messages">
            {messages.length === 0 && (
              <div className="msg assistant">
                Guten Tag! Ich bin der WIFI Bildungsnavigator, ein KI-Assistent. Ich helfe Ihnen bei Kursfragen, WIFI-Bildungswegen
                und bei Ihrer beruflichen Orientierung. Worum geht es Ihnen?
              </div>
            )}
            {messages.map((m) => (
              <div key={m.id + m.createdAt} className={`msg ${m.role}`}>
                <RichText text={m.content} />
                {m.sources && m.sources.length > 0 && (
                  <div className="sources">
                    <strong>Quellen:</strong>
                    <ol>
                      {m.sources.map((s) => (
                        <li key={s.url}>
                          <a href={s.url} target="_blank" rel="noopener noreferrer">
                            {s.title || s.url}
                          </a>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            ))}
            {busy && <div className="msg assistant muted">Der Bildungsnavigator denkt nach …</div>}
            <div ref={bottom} />
          </div>
          {error && <div className="error" style={{ padding: "0 20px" }}>{error}</div>}
          <form className="composer" onSubmit={send}>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder={closed ? "Dieser Fall ist beendet – bitte neuen Fall starten." : "Ihre Frage … (Enter zum Senden)"}
              disabled={busy || !!closed}
              maxLength={4000}
            />
            <button className="primary" type="submit" disabled={busy || !!closed || !input.trim()}>
              Senden
            </button>
          </form>
        </main>

        <aside className="sidepanel">
          {!active ? (
            <p className="muted small">Mit der ersten Nachricht wird ein neuer Beratungsfall mit eigener Fallnummer angelegt.</p>
          ) : (
            <>
              <div className="section">
                <h3>Fall {active.id}</h3>
                <dl className="kv">
                  <dt>Status</dt>
                  <dd>{active.status}</dd>
                  <dt>Level</dt>
                  <dd>{active.finalLevel ? `${active.finalLevel} – ${LEVEL_NAMES[active.finalLevel]}` : "noch offen"}</dd>
                  {active.levelChanges.length > 1 && (
                    <>
                      <dt>Levelwechsel</dt>
                      <dd>{active.levelChanges.map((l) => l.to).join(" → ")}</dd>
                    </>
                  )}
                  <dt>Thema</dt>
                  <dd>{active.topic ?? "–"}</dd>
                  <dt>Kurse</dt>
                  <dd>{active.courseNumbers.join(", ") || "–"}</dd>
                  <dt>Buchung</dt>
                  <dd>{active.bookings.map((b) => `${b.dateId} (sim.)`).join(", ") || "–"}</dd>
                  <dt>Übergabe</dt>
                  <dd>{active.handover ? `${active.handover.target} (${active.handover.channel})` : "–"}</dd>
                </dl>
              </div>
              <div className="section row">
                <a href={`/api/cases/${active.id}/report`}>
                  <button type="button">Word-Bericht</button>
                </a>
                {active.status === "offen" && (
                  <>
                    <button type="button" onClick={() => setStatus("abgeschlossen")}>
                      Abschließen
                    </button>
                    <button type="button" onClick={() => setStatus("abgebrochen")}>
                      Abbrechen
                    </button>
                  </>
                )}
              </div>
              <div className="section">
                <h3>Bewertung durch Testperson</h3>
                <FeedbackForm key={active.id} caseData={active} onSaved={setActive} />
              </div>
            </>
          )}
        </aside>
      </div>
    </>
  );
}
