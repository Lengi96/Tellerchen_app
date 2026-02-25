# Go-Live Checklist (Phase 1)

Stand: 2026-02-25

## Ziel
- Phase-1 Go-Live-Readiness für `mein-nutrikompass.de` mit Fokus auf Legal, Security, Payments, Mindest-Tests und Betriebsdokumentation.

## 1. Legal / Compliance
- [x] `Impressum` vorhanden und befüllt
- [x] `Datenschutz` vorhanden und befüllt
- [x] `AGB` vorhanden und befüllt
- [x] `AVV` online einsehbar (`/avv`)
- [x] Landingpage/Footer verlinkt Legal-Seiten inkl. AVV
- [x] Zentrale Legal-Datenquelle (`src/config/legal.ts`)
- [x] Build-Guard für Legal-Pflichtdaten (`npm run legal:check`)

Prüfen:
- `npm run legal:check`
- `npm run build`
- Seiten öffnen: `/impressum`, `/datenschutz`, `/agb`, `/avv`

## 2. Security (Web/App)
- [x] Security Headers gesetzt (CSP, XCTO, Referrer, XFO, Permissions-Policy)
- [x] HSTS in Produktion gesetzt
- [x] CSP ohne `unsafe-eval` in Produktion
- [x] ENV-Validation vor Build (`npm run env:check`)
- [x] App-seitige Mandantenisolation via tRPC/AuthZ (`organizationId`, Rollen)
- [x] Supabase RLS für relevante `public`-Tabellen aktiviert (SQL-Härtung vorhanden)
- [ ] RLS-Policies versioniert (nur nötig bei direkter Supabase API-Nutzung)

Prüfen:
- `npm run env:check`
- `npm run build`
- Response-Header im Browser/`curl` prüfen
- Supabase SQL-Check auf `rowsecurity = true`

## 3. Payments (Stripe)
- [x] Checkout/Portal implementiert
- [x] Webhook-Signaturprüfung implementiert
- [x] DB-Statusupdate per Webhook (`subscriptionStatus`, `subscriptionPlan`)
- [x] Success-UI wartet auf serverseitige Bestätigung (Polling)

Prüfen (Stripe Testmodus):
- Checkout starten
- Webhook-Event empfangen
- `/billing/success` zeigt zuerst Pending, danach Aktiv
- `/billing` zeigt korrekten Status

## 4. Tests / CI (Minimum Evidence)
- [x] CI mit `lint`
- [x] CI mit `build`
- [x] CI mit Smoke-Tests
- [x] Smoke: Landing + Legal + Auth-Seiten + Health Endpoint

Prüfen:
- GitHub Actions `CI` Workflow grün
- Lokal optional: `npm run test:smoke`

## 5. Ops / Dokumentation
- [x] Go-Live-Checklist
- [x] Security/Ops Runbook (light)
- [x] Privacy/Data-Flow Übersicht
- [x] Incident / Rotation / Backup Notizen

## 6. Offene Punkte nach Phase 1 (bewusst verschoben)
- RLS-Policies als Code versionieren (falls Supabase PostgREST/Auth aktiviert wird)
- Kontakt/Demo Backend-Flow mit Consent-Logging/Rate-Limit (aktuell `mailto`)
- Erweiterte Security-Audit-Logs außerhalb Autonomie-Modul
- E2E-Tests für Login + Dashboard-Funktionalität mit Testdaten

