# Privacy / Data Flow (Light)

Stand: 2026-02-25

## Zweck
- Überblick über Datenflüsse für Betrieb, Datenschutzgespräche und Go-Live-Prüfung.
- Technische Beschreibung des Ist-Stands (keine juristische Bewertung).

## Rollenmodell (vereinfacht)
- Anbieter / Betreiber: `mein-nutrikompass.de` (SaaS-Betrieb)
- Kunden (Einrichtungen): Verantwortliche für eingegebene Patientendaten
- App: Auftragsverarbeitung im Rahmen des Dienstes

## Hauptdatenflüsse

### 1) Registrierung / Login (Mitarbeiter der Einrichtung)
1. Nutzer registriert sich oder wird eingeladen.
2. App speichert Nutzerdaten in `User` (inkl. `passwordHash`).
3. Login erfolgt über NextAuth Credentials.
4. Session läuft als JWT mit `id`, `email`, `name`, `role`, `organizationId`.

Betroffene Daten:
- Name, E-Mail, Passwort-Hash, Rolle, Organisationszuordnung

Speicherorte:
- Supabase Postgres (`public.User`)

### 2) Patientenverwaltung / Planung
1. Nutzer legt pseudonymisierte Patientendaten an (`Patient`).
2. Gewichtsverläufe (`WeightEntry`) und Planungsdaten (`MealPlan`, `ShoppingList`) werden gespeichert.
3. tRPC erzwingt Mandantenbezug über `organizationId` aus Session.

Betroffene Daten (fachlich):
- Pseudonyme/Kürzel, Geburtsjahr, Gewichte, Allergien, Notizen, Plan-/Einkaufsdaten

Hinweis:
- Zielbild ist pseudonymisierte Verarbeitung; keine Klarnamen von Patienten.

### 3) KI-Planerstellung (OpenAI)
1. Server erstellt Prompt aus Patientendaten und Einstellungen.
2. Anfrage geht serverseitig an OpenAI API.
3. Antwort wird validiert/strukturiert verarbeitet und als Plan gespeichert.

Übermittelte Daten an OpenAI (beabsichtigt):
- Pseudonymisierte, fachlich notwendige Angaben
- Keine Klarnamen / direkten Identifikatoren

### 4) E-Mail-Versand (Resend)
Use Cases:
- E-Mail-Verifizierung
- Passwort-Reset
- Mitarbeitereinladung

Übermittelte Daten:
- E-Mail-Adresse, Name (Mitarbeiter), transaktionale Inhalte/Links
- Kein Patientenbezug erforderlich

### 5) Billing (Stripe)
1. App erstellt Stripe Checkout Session (serverseitig).
2. Stripe verarbeitet Zahlungsdaten.
3. Webhook aktualisiert Subscription-Status in `Organization`.
4. UI liest Status aus DB und zeigt Billing-Zustand an.

Hinweis:
- Zahlungsdaten selbst liegen bei Stripe, nicht in der App-DB.

## Unterauftragnehmer / technische Dienste (Phase 1 relevant)
- Supabase (Postgres Hosting)
- OpenAI (KI-API)
- Resend (E-Mail)
- Stripe (Zahlung)
- Netlify (Hosting / Runtime)

## Schutzmaßnahmen (technisch)
- Authentifizierung via NextAuth + Passwort-Hashing (`bcrypt`)
- Rollen- und Mandantenprüfungen serverseitig (tRPC)
- Security Headers + CSP
- ENV-Checks und Legal-Checks vor Build
- Supabase RLS aktiviert auf exponierten `public`-Tabellen (Phase-1 Härtung)
- Domänenspezifisches Audit-Log für Autonomie-Absprachen (`AutonomyAuditLog`)

## Datenexport / Löschung (App-Funktionen, Ist-Stand)
- Datenexport (DSGVO-Feature) im Staff-/Settings-Kontext vorhanden
- Löschung aktuell als vereinfachter/teilweiser Prozess (Soft-Delete von Patienten) plus Supportkontakt
- Vollständige Betriebsprozesse (Fristen, Nachweise, Ticketing) separat organisatorisch regeln

## Offene Punkte für spätere Phasen
- Versionierte RLS-Policies als SQL
- Generisches Security-/Admin-Audit-Logging
- Dokumentierte Lösch-/Aufbewahrungsprozesse mit Nachweisformat

