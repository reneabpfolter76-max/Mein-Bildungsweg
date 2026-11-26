# WIFI Bildungsnavigator – Prototyp (interner Pilot 1.0)

KI-gestützter Bildungsberater, der Kundinnen und Kunden rund um die Uhr informiert, orientiert und zu Buchungen
oder persönlichen Beratungsgesprächen führt. Grundlage: *WIFI Bildungsnavigator – Projektgrundlage Internal Pilot 1.0*.

> **Interner Pilot:** ausschließlich fiktive Kunden- und Kursdaten, simulierte Buchungen, keine CRM-Schreibvorgänge.

## Was der Prototyp kann

| Bereich | Umsetzung |
|---|---|
| Zugang | Kostenlos für alle angemeldeten Personen. Im Pilot simuliertes myWIFI-Login (Testpersonen-ID, Zugangscode, fiktives Profil); später echtes myWIFI-Login. |
| Fair Use | Tageslimit pro Person, monatliche Kostenobergrenze, Pause-Schalter – im Admin-Dashboard einstellbar. |
| Beratung | Ein Assistent mit L1/L2/L3-Triage und Levelwechsel (Masterprompt `v0.1`, `lib/advisor/masterprompt.ts`). |
| L1 Kursinformation | Fiktiver Kurskatalog mit Terminen, Preisen, freien Plätzen; simulierte Buchung. |
| L2 Fachberatung | Strukturiertes Intake, Übergabe an Fachbereich (simuliert). Keine Zulassungs-/Förderentscheidungen. |
| L3 Bildungsorientierung | Anbieterübergreifend, Websuche mit Quellen und Recherchedatum. |
| Dokumentation | Jeder Fall ab der ersten Nachricht mit Fall-ID (inkl. Abbrüchen), alle Felder aus Kap. 5, Modell- und Prompt-Version. |
| Ergebnisse | Word-Bericht je Fall, Feedback (8 Kriterien 1–5, Kundenfreigabe, Fehlerbeschreibung). |
| Administration | Kennzahlen-Dashboard, Excel-Export ohne Klarnamen/E-Mail/Kunden-ID. |

## Schnellstart (lokal, ohne Konten)

```bash
npm install
cp .env.example .env.local     # Zugangscodes anpassen
npm run dev                    # http://localhost:3000
```

Ohne `OPENAI_API_KEY` läuft die App im **Demo-Modus** (regelbasierte Antworten, keine KI) – damit lassen sich
Oberfläche, Fallspeicherung, Bericht und Export ohne Kosten testen. Ohne Supabase-Werte wird lokal in
`.data/store.json` gespeichert.

- Testperson: beliebige ID (z. B. `T01`) + `PILOT_ACCESS_CODE`
- Administration: beliebige ID + `ADMIN_ACCESS_CODE` → `/admin`

Veröffentlichung auf Vercel mit Supabase: siehe [docs/INSTALLATION.md](docs/INSTALLATION.md).
Testfälle für den Pilot: [docs/TESTKATALOG.md](docs/TESTKATALOG.md).
Architektur und Weg zur myWIFI-Integration: [docs/ARCHITEKTUR.md](docs/ARCHITEKTUR.md).

## Befehle

| Befehl | Zweck |
|---|---|
| `npm run dev` | Entwicklungsserver |
| `npm run build` / `npm start` | Produktions-Build / -Server |
| `npm test` | Unit-Tests (Vitest) |
| `npm run lint` | TypeScript-Prüfung |
