# Architektur und Weg zur myWIFI-Integration

## Komponenten

```
Browser ──► Next.js (Vercel, fra1)
              ├─ /login              simuliertes myWIFI-Login  (lib/auth/provider.ts)
              ├─ /                   Beratungschat
              ├─ /admin              Dashboard, Einstellungen, Excel-Export
              └─ /api/*              Chat, Fälle, Bericht, Feedback, Export
                    ├─ lib/advisor   Masterprompt, Werkzeuge, OpenAI Responses API (+ Websuche)
                    ├─ lib/store     Supabase (EU) bzw. lokale Datei
                    └─ lib/report    Word-Bericht (docx), Excel-Export (exceljs)
```

## Kostenlose Nutzung für alle myWIFI-Registrierten

- **Zugang = Anmeldung.** Es gibt keine Bezahlfunktion, aber auch keine anonyme Nutzung. Jede Anfrage ist einer
  angemeldeten Person zugeordnet (`Identity`), dadurch sind Limits, Fortsetzen von Fällen und Auswertung möglich.
- **Fair Use statt Bezahlung:** Tageslimit pro Person, monatliche Kostenobergrenze, Pause-Schalter. Bei Erreichen
  wird freundlich auf die persönliche Beratung verwiesen.
- **Kosten skalieren mit der Nutzung.** Die Planungsannahme der Projektgrundlage (100 Beratungen/Monat) gilt für den
  Pilot. Bei Öffnung für alle Registrierten Tokenverbrauch je Beratung aus dem Pilot messen (Dashboard: Kosten je Fall)
  und Budget daraus hochrechnen.

## Austausch des simulierten Logins (Phase 3)

Die Anwendung arbeitet nur mit dem Typ `Identity` (`lib/auth/session.ts`):

```ts
{ userId, customerId, profileId, role }
```

Für die Produktivintegration wird `simulatedMyWifiLogin` durch die myWIFI-Anmeldung ersetzt (bevorzugt OpenID Connect
mit der WIFI-IT abstimmen):

1. `/login` leitet zum myWIFI-Login weiter, Callback-Route prüft das Token.
2. `userId` = pseudonyme ID, `customerId` = myWIFI-/CRM-Kunden-ID, Profil aus CRM statt `lib/data/profiles.ts`.
3. Rollen für berechtigte Fachberaterinnen und Fachberater aus dem Identitätssystem übernehmen.

## Weitere Integrationsschritte

| Pilot | Produktiv |
|---|---|
| `lib/data/courses.ts` (fiktiv) | Kurs- und Terminschnittstelle des WIFI |
| simulierte Buchung | Weiterleitung in den echten Buchungsprozess |
| simulierte Übergabe | Übergabe an CRM-Fall bzw. Terminvereinbarung |
| Excel-Download | täglicher Export nach SharePoint (Power Automate), Power BI |

## Datenschutz (vor Produktivbetrieb klären)

- Personenbezogene Stammdaten bleiben im CRM; die App speichert Testpersonen-ID und fiktive Kunden-ID.
- Excel-Export ohne Klarnamen, E-Mail-Adressen und Kunden-ID.
- Gesprächsverläufe werden für Bericht und Qualitätssicherung gespeichert – Löschfristen festlegen.
- EU-AI-Act: KI-Transparenzhinweis ist in Oberfläche und Masterprompt umgesetzt; Einordnung des Systems offen.
