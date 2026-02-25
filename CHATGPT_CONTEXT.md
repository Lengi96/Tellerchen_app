# ChatGPT Project Context: `Tellerchen_app` / mein-nutrikompass.de

## Kurzbeschreibung
- Web-App für KI-gestützte Ernährungsplanung in Einrichtungen (z. B. Jugendwohngruppen).
- Fokus auf strukturierte Essensplanung, Einkaufslisten, Rollenverwaltung und patientenbezogene Dokumentation (mit Pseudonymen).
- Mehrmandantenfähig über `Organization` (Mandanten-/Einrichtungs-Kontext).

## Tech Stack
- `Next.js 14` (App Router)
- `TypeScript`
- `tRPC`
- `Prisma` + `PostgreSQL` (Supabase als DB-Host)
- `NextAuth` (Credentials Login, JWT-Session)
- `Tailwind CSS`
- `OpenAI API` (Mahlzeiten-/Plan-Generierung)
- `Stripe` (Abos/Billing)
- `Resend` (E-Mails)

## Architektur (High-Level)
- Frontend: Next.js App Router (`src/app`)
- API/Backend-Logik: tRPC-Router (`src/trpc/routers`)
- Auth: NextAuth mit Credentials Provider (`src/server/auth.ts`)
- Datenzugriff: Prisma Client (`src/lib/prisma.ts`)
- Datenbankmodell: `prisma/schema.prisma`
- Middleware/Route-Schutz: `src/middleware.ts`

## Zentrale Domänenobjekte (Prisma)
- `Organization`: Mandant/Einrichtung + Stripe-/Abo-Daten
- `User`: Mitarbeitende/Admins, Credentials-Auth, Rollen (`ADMIN`, `STAFF`)
- `Patient`: Patient:in (pseudonymisiert, Gewichts-/Zielwerte, Notizen)
- `WeightEntry`: Gewichtsverlauf
- `MealPlan`: Wochen-/Mehrtagesplan (inkl. `planJson`, AI Prompt)
- `ShoppingList`: Einkaufsliste zu einem MealPlan
- `StaffInvitation`: Einladungen für Mitarbeitende
- `AutonomyAgreement`: strukturierte Selbstständigkeitsabsprachen
- `AutonomyAuditLog`: unveränderliches Änderungsprotokoll zu Absprachen

## Mandanten- und Rollenlogik (wichtig)
- Fast alle Daten sind organisationsgebunden über `organizationId`.
- tRPC nutzt `protectedProcedure` und `adminProcedure` in `src/trpc/init.ts`.
- `protectedProcedure` liest `organizationId` aus der Session, nicht vom Client.
- `adminProcedure` erzwingt Rolle `ADMIN`.
- UI/Route-Schutz via `src/middleware.ts`; `/settings` nur für `ADMIN`.

## Authentifizierung
- NextAuth Credentials Login (kein Supabase Auth).
- Passwortprüfung mit `bcryptjs`.
- Session-Strategie: JWT (`src/server/auth.config.ts`).
- Session/JWT enthält:
  - `id`
  - `email`
  - `name`
  - `role`
  - `organizationId`

## Datenbank / Supabase Hinweise
- Datenbank läuft auf Supabase PostgreSQL.
- Prisma nutzt i. d. R. `DATABASE_URL` über Supabase Transaction Pooler (`:6543`) mit PgBouncer-Parametern.
- `DIRECT_URL` ist für Migrationen vorgesehen (`:5432` Session Mode).
- Prisma-Client ergänzt Supabase-Pooler-Parameter automatisch in `src/lib/prisma.ts`.

## Sicherheitsrelevante Punkte (aktueller Stand)
- App-Zugriffe laufen primär über Prisma/tRPC serverseitig, nicht über Supabase PostgREST.
- Für Supabase Security Advisor wurden RLS-Probleme auf `public`-Tabellen gemeldet.
- RLS-Härtung wurde als SQL-Datei angelegt: `prisma/supabase-rls-hardening.sql`.
- Nach Ausführung sollte auf folgenden Tabellen `rowsecurity = true` gelten:
  - `Organization`, `User`, `Patient`, `WeightEntry`, `MealPlan`, `ShoppingList`, `StaffInvitation`, `AutonomyAgreement`, `AutonomyAuditLog`
- Hinweis: Supabase Advisor kann Ergebnisse verzögert/cached anzeigen, auch wenn RLS bereits aktiv ist.

## Sensible Daten / Token
- `User.passwordHash` wird sicher gehasht gespeichert (`bcrypt`).
- E-Mail-Verification- und Passwort-Reset-Tokens werden gehasht gespeichert.
- `StaffInvitation.token` wird inzwischen ebenfalls gehasht gespeichert.
- In `src/trpc/routers/staff.ts` existiert ein Fallback für alte Einladungen mit Klartext-Token (`where: { token: input.token }`) zur Abwärtskompatibilität.
- Langfristig kann dieser Fallback entfernt werden, sobald Alt-Daten nicht mehr relevant sind.

## Wichtige tRPC Router
- `auth`: Registrierung, Login-nahe Flows, E-Mail-Verifizierung, Passwort-Reset, Profil
- `patients`: Patientenverwaltung
- `mealPlans`: KI-Planerzeugung, Planverwaltung, Plan-Details
- `shoppingList`: Einkaufslisten aus MealPlans
- `staff`: Teamverwaltung, Einladungen, Rollenänderung
- `organization`: Einrichtungsdaten
- `billing`: Stripe Checkout / Billing Portal / Abo-Status
- `autonomy`: Selbstständigkeitsabsprachen + Audit-Log

## Externe Integrationen
- `OpenAI`: Plan-/Rezept-/Ernährungslogik (`src/lib/openai/*`)
- `Stripe`: Checkout, Billing Portal, Webhooks (`src/app/api/webhooks/stripe/route.ts`)
- `Resend`: Verifizierungs-, Passwort-Reset- und Einladungs-E-Mails (`src/lib/email.ts`)

## Lokale Entwicklung (Kurz)
1. `npm install`
2. `.env.example` nach `.env` kopieren und Werte setzen
3. `npm run db:generate`
4. `npm run db:migrate` oder `npm run db:push`
5. optional `npm run db:seed`
6. `npm run dev`

## Wichtige Scripts
- `npm run dev`
- `npm run build`
- `npm run lint`
- `npm run db:generate`
- `npm run db:migrate`
- `npm run db:push`
- `npm run db:seed`
- `npm run db:studio`

## Seed-Daten (nur lokal/dev)
- Demo-Organisation: `Jugendwohngruppe Sonnenhof`
- Demo-Admin: `admin@mein-nutrikompass.de`
- Demo-Staff: `mitarbeiter@mein-nutrikompass.de`
- Passwort (beide): `Passwort123!`
- Achtung: Nur für lokale Entwicklung/Tests verwenden.

## Wichtige Arbeitsprinzipien im Code (für ChatGPT/Codex)
- Änderungen möglichst entlang bestehender Architektur (App Router + tRPC + Prisma) umsetzen.
- Mandantenisolation (`organizationId`) nie clientseitig vertrauen.
- Rollenprüfungen serverseitig erzwingen (`adminProcedure` statt nur UI-Checks).
- Keine echten Patientennamen/PII in Beispielcode, Tests oder Seeds einführen.
- Bei DB-Schemaänderungen:
  - Prisma-Schema aktualisieren
  - Migrationsstrategie bedenken (`db:migrate` / Supabase SQL)
  - Auswirkungen auf bestehende Daten und tRPC-Queries prüfen
- Bei sicherheitsrelevanten Änderungen immer Token-/Zugriffsmodell mitprüfen.

## Typische Dateien für schnellen Einstieg
- `README.md`
- `prisma/schema.prisma`
- `src/trpc/init.ts`
- `src/trpc/routers/_app.ts`
- `src/server/auth.ts`
- `src/server/auth.config.ts`
- `src/middleware.ts`
- `src/lib/prisma.ts`

## Offene/zu beachtende Punkte
- Supabase Security Advisor Findings können trotz korrekter RLS-Aktivierung zeitverzögert verschwinden.
- Wenn künftig Supabase PostgREST direkt genutzt wird, müssen explizite RLS-Policies definiert werden (RLS aktiv allein reicht nicht).

