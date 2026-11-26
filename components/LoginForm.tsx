"use client";

import { useState } from "react";

interface Props {
  profiles: { id: string; name: string; description: string }[];
}

export default function LoginForm({ profiles }: Props) {
  const [testerId, setTesterId] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [profileId, setProfileId] = useState(profiles[0]?.id ?? "");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ testerId, accessCode, profileId }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return setError(data.error ?? "Anmeldung fehlgeschlagen.");
    window.location.href = data.role === "admin" ? "/admin" : "/";
  }

  const selected = profiles.find((p) => p.id === profileId);

  return (
    <form onSubmit={submit}>
      <label htmlFor="tester">Testpersonen-ID</label>
      <input id="tester" value={testerId} onChange={(e) => setTesterId(e.target.value)} placeholder="z. B. T01" autoComplete="off" required />
      <label htmlFor="code">Zugangscode</label>
      <input id="code" type="password" value={accessCode} onChange={(e) => setAccessCode(e.target.value)} required />
      <label htmlFor="profile">Simuliertes myWIFI-Profil</label>
      <select id="profile" value={profileId} onChange={(e) => setProfileId(e.target.value)}>
        {profiles.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
      {selected && <p className="muted small">{selected.description}</p>}
      {error && <p className="error">{error}</p>}
      <button className="primary" type="submit" disabled={busy} style={{ marginTop: 14, width: "100%" }}>
        {busy ? "Anmelden …" : "Anmelden"}
      </button>
    </form>
  );
}
