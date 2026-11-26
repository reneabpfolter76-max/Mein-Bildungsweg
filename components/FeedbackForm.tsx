"use client";

import { useState } from "react";
import { RATING_LABELS, type Case, type CustomerRelease, type Ratings } from "@/lib/types";

const KEYS = Object.keys(RATING_LABELS) as (keyof Ratings)[];

export default function FeedbackForm({ caseData, onSaved }: { caseData: Case; onSaved: (c: Case) => void }) {
  const [ratings, setRatings] = useState<Partial<Ratings>>(caseData.ratings ?? {});
  const [release, setRelease] = useState<CustomerRelease | "">(caseData.customerRelease ?? "");
  const [errorDescription, setErrorDescription] = useState(caseData.errorDescription ?? "");
  const [feedback, setFeedback] = useState(caseData.feedback ?? "");
  const [uncoveredNeed, setUncoveredNeed] = useState(caseData.uncoveredNeed ?? "");
  const [msg, setMsg] = useState("");

  const complete = KEYS.every((k) => ratings[k]) && release;

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    const res = await fetch(`/api/cases/${caseData.id}/feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ratings, customerRelease: release, errorDescription, feedback, uncoveredNeed }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return setMsg(data.error ?? "Speichern fehlgeschlagen.");
    onSaved(data.case);
    setMsg("Bewertung gespeichert.");
  }

  return (
    <form onSubmit={save}>
      <p className="muted small" style={{ marginTop: 0 }}>1 = sehr schlecht, 5 = sehr gut</p>
      {KEYS.map((k) => (
        <div className="rating" key={k}>
          <span>{RATING_LABELS[k]}</span>
          <select value={ratings[k] ?? ""} onChange={(e) => setRatings((r) => ({ ...r, [k]: Number(e.target.value) }))}>
            <option value="">–</option>
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
      ))}
      <label className="small">Kundenfreigabe</label>
      <select value={release} onChange={(e) => setRelease(e.target.value as CustomerRelease)}>
        <option value="">bitte wählen</option>
        <option value="ja">ja</option>
        <option value="nach_ueberarbeitung">nach Überarbeitung</option>
        <option value="nein">nein</option>
      </select>
      <label className="small">Fehlerbeschreibung</label>
      <textarea rows={2} value={errorDescription} onChange={(e) => setErrorDescription(e.target.value)} />
      <label className="small">Nicht abgedeckter Bildungsbedarf</label>
      <input value={uncoveredNeed} onChange={(e) => setUncoveredNeed(e.target.value)} />
      <label className="small">Weiteres Feedback</label>
      <textarea rows={2} value={feedback} onChange={(e) => setFeedback(e.target.value)} />
      <button className="primary" type="submit" disabled={!complete} style={{ marginTop: 10, width: "100%" }}>
        Bewertung speichern
      </button>
      {msg && <p className="small">{msg}</p>}
    </form>
  );
}
