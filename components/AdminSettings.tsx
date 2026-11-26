"use client";

import { useState } from "react";
import type { Settings } from "@/lib/types";

export default function AdminSettings({ initial }: { initial: Settings }) {
  const [s, setS] = useState(initial);
  const [msg, setMsg] = useState("");

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    const res = await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(s),
    });
    setMsg(res.ok ? "Gespeichert." : "Speichern fehlgeschlagen.");
  }

  return (
    <form onSubmit={save} className="row" style={{ alignItems: "flex-end" }}>
      <div>
        <label className="small">Nachrichten pro Person und Tag</label>
        <input type="number" min={1} value={s.dailyMessageLimit} onChange={(e) => setS({ ...s, dailyMessageLimit: Number(e.target.value) })} />
      </div>
      <div>
        <label className="small">Kostenobergrenze pro Monat (EUR, 0 = keine)</label>
        <input type="number" min={0} step="1" value={s.monthlyBudgetEur} onChange={(e) => setS({ ...s, monthlyBudgetEur: Number(e.target.value) })} />
      </div>
      <div>
        <label className="small">
          <input type="checkbox" style={{ width: "auto", marginRight: 6 }} checked={s.paused} onChange={(e) => setS({ ...s, paused: e.target.checked })} />
          Assistent pausieren
        </label>
      </div>
      <button className="primary" type="submit">
        Speichern
      </button>
      {msg && <span className="small">{msg}</span>}
    </form>
  );
}
