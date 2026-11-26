# Installation und Veröffentlichung (Vercel + Supabase + OpenAI)

Dauer: ca. 30 Minuten. Benötigt werden drei Konten, die dem WIFI bzw. der budgetverantwortlichen Stelle gehören sollten
(Projektgrundlage Kap. 8: Hosting- und API-Konten festlegen).

## 1. Supabase (Datenbank, Region EU)

1. Auf <https://supabase.com> ein Projekt anlegen, **Region: Central EU (Frankfurt)** wählen.
2. Im *SQL Editor* den Inhalt von [`supabase/schema.sql`](../supabase/schema.sql) ausführen.
3. Unter *Project Settings → API* notieren:
   - `Project URL` → `SUPABASE_URL`
   - `service_role` Key → `SUPABASE_SERVICE_ROLE_KEY` (**geheim**, nur serverseitig verwenden)

Row Level Security ist aktiviert; der Browser hat keinen direkten Datenbankzugriff.

## 2. OpenAI (KI)

1. Auf <https://platform.openai.com> einen API-Schlüssel anlegen → `OPENAI_API_KEY`.
2. Ein **monatliches Ausgabenlimit** im OpenAI-Konto setzen (zusätzlich zur Kostenobergrenze in der App).
3. Modell über `OPENAI_MODEL` wählen (Standard `gpt-5-mini`). Websuche über `OPENAI_WEB_SEARCH`.
4. Die App sendet Anfragen mit `store: false` (keine Speicherung der Antworten bei OpenAI über die API-Antwort hinaus).
   Auftragsverarbeitung, Datenstandort und Aufbewahrung sind trotzdem datenschutzrechtlich zu prüfen.

## 3. Vercel (Hosting)

1. Auf <https://vercel.com> *Add New → Project* und dieses GitHub-Repository importieren (Framework: Next.js).
2. Unter *Settings → Environment Variables* alle Werte aus [`.env.example`](../.env.example) setzen:

| Variable | Wert |
|---|---|
| `SESSION_SECRET` | zufälliger Wert, mind. 32 Zeichen (z. B. `openssl rand -base64 48`) |
| `PILOT_ACCESS_CODE` | Zugangscode für Testpersonen |
| `ADMIN_ACCESS_CODE` | eigener, starker Code für das Dashboard |
| `OPENAI_API_KEY`, `OPENAI_MODEL`, `OPENAI_WEB_SEARCH` | siehe oben |
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | siehe oben |
| `PRICE_*` | Preisannahmen für die Kostenschätzung – mit aktuellen OpenAI-Preisen abgleichen |

3. *Deploy*. Unter *Settings → Functions* die Region **Frankfurt (fra1)** wählen.
4. Optional zusätzlich *Deployment Protection* (Passwortschutz) aktivieren, damit der Link nur für Testpersonen erreichbar ist.

## 4. Pilot starten

1. Als Admin anmelden (`/login`, Zugangscode = `ADMIN_ACCESS_CODE`) → `/admin`.
2. Tageslimit und Kostenobergrenze prüfen (Standard: 40 Nachrichten/Tag, 50 €/Monat).
3. Testpersonen erhalten Link, ihre Testpersonen-ID (T01 … T10) und den `PILOT_ACCESS_CODE`.
4. Testfälle aus [TESTKATALOG.md](TESTKATALOG.md) verteilen; jede Testperson bewertet jeden Fall im rechten Bereich.
5. Täglich Excel-Export im Dashboard ziehen (Datenbank bleibt führend).

## Lokal entwickeln

```bash
npm install
cp .env.example .env.local
npm run dev
npm test
```
