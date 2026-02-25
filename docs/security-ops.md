# Security / Ops Runbook (Light)

Stand: 2026-02-25

## Architektur (relevant für Security)
- Frontend/Backend: Next.js App Router
- Auth: `NextAuth` (Credentials) + JWT Session
- Datenzugriff: `Prisma` auf Supabase Postgres
- Mandantenlogik: App-seitig über `organizationId` + Rollenprüfungen
- Payments: Stripe Checkout + Webhook
- E-Mail: Resend
- KI: OpenAI API (serverseitig)

## Wichtige Sicherheitskontrollen (Ist-Stand)
- HTTP Security Headers in `next.config.mjs`
  - `Content-Security-Policy`
  - `X-Frame-Options`
  - `X-Content-Type-Options`
  - `Referrer-Policy`
  - `Permissions-Policy`
  - `Strict-Transport-Security` (nur Produktion)
- CSP:
  - Produktion ohne `unsafe-eval`
  - Development erlaubt `unsafe-eval` für lokale Kompatibilität
- ENV-Fail-Fast:
  - `npm run env:check`
  - `npm run build` führt `env:check` automatisch aus
- Legal-Fail-Fast:
  - `npm run legal:check`
  - `npm run build` führt `legal:check` automatisch aus

## Auth / Zugriff
- Serverseitige Autorisierung über tRPC-Prozeduren:
  - `protectedProcedure`: Login erforderlich
  - `adminProcedure`: Rolle `ADMIN` erforderlich
- `organizationId` wird aus Session gelesen, nicht vom Client vertraut
- Middleware schützt öffentliche/geschützte Routen und sperrt `/settings` für Nicht-Admins

## Datenbank / RLS
- Supabase Security Advisor meldete fehlendes RLS auf `public`-Tabellen.
- SQL-Härtung im Repo: `prisma/supabase-rls-hardening.sql`
- Ziel/Status Phase 1:
  - RLS aktiviert auf relevanten Tabellen (`rowsecurity = true`)
  - Policies aktuell nicht als SQL im Repo versioniert
- Wichtig:
  - App verwendet primär Prisma-Serverzugriff, nicht Supabase PostgREST.
  - Bei künftiger direkter Supabase API-Nutzung müssen Policies ergänzt werden.

## Payments / Billing Betrieb
- Stripe Webhook-Endpunkt: `/api/webhooks/stripe`
- Webhook-Signatur wird geprüft (`STRIPE_WEBHOOK_SECRET`)
- Subscription-Status wird in `Organization` gepflegt
- Billing Success UI wartet auf DB-/Webhook-Bestätigung statt sofortigem "aktiv"

## Deployment (Netlify)
- Build-Befehl in `netlify.toml`: `npm run db:generate && npm run build`
- `npm run build` enthält bereits Legal-/ENV-Checks
- Konsequenz: Fehlende Pflicht-ENV oder Legal-Daten blockieren Deploy

## Regelmäßige Prüfungen (Betrieb)
- Nach Deploy:
  - Landing / Legal Seiten aufrufen
  - Login testen
  - `/api/health` prüfen
  - Security Headers stichprobenartig prüfen
- Monatlich:
  - Legal-Texte auf Aktualität prüfen (Kontaktdaten, USt-Status, Unterauftragnehmer)
  - Stripe Webhook-Ereignisse auf Fehler prüfen
  - Supabase Security Advisor erneut prüfen
- Nach Schemaänderungen:
  - Prisma-Migration / `db push` prüfen
  - Auswirkungen auf Mandantenisolation / RLS bewerten

## Betriebsrisiken (aktuell bewusst akzeptiert)
- Kein versionierter Satz von RLS-Policies im Repo (nur RLS-Aktivierung)
- Kein generisches Security-Audit-Log (außer Autonomie-Audit-Log)
- Kontakt/Demo-Flow via `mailto` ohne eigenes Rate-Limit/Consent-Logging

