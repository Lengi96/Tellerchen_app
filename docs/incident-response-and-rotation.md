# Incident Response / Key Rotation / Backup Notes (Light)

Stand: 2026-02-25

## Zweck
- Kompakte Betriebsnotizen für Sicherheitsvorfälle, Schlüsselrotation und Wiederherstellung.
- Kein vollständiges ISMS, aber ausreichend für Phase-1 Betriebsvorbereitung.

## 1. Sicherheitsvorfall (Initialreaktion)

### Auslöser (Beispiele)
- Verdacht auf unbefugten Zugriff
- Auffällige Stripe-Webhook-/Billing-Fehler
- Datenleck-Verdacht / Fehlversand von E-Mails
- Kompromittierter API-Key (OpenAI, Resend, Stripe)
- Fehlkonfiguration nach Deploy

### Sofortmaßnahmen (technisch)
1. Betroffene Funktion temporär deaktivieren (z. B. Deploy zurückrollen, Feature stoppen).
2. Relevante Secrets rotieren (siehe unten).
3. Logs/Beobachtungen sichern (Zeitpunkt, betroffene Endpunkte, Org-IDs, Fehlerbilder).
4. Umfang eingrenzen:
   - Welche Datenkategorien?
   - Welche Kunden/Orgs?
   - Laufender Zugriff noch aktiv?
5. Fix oder Mitigation deployen.

### Minimaler Vorfall-Record (intern)
- Datum/Uhrzeit (UTC + lokal)
- Entdeckt durch (Monitoring/User/Support)
- Betroffene Systeme (Next.js, DB, Stripe, Resend, OpenAI)
- Betroffene Datenkategorien (ja/nein)
- Betroffene Kunden (falls bekannt)
- Sofortmaßnahmen
- Status (offen/unter Kontrolle/geschlossen)

## 2. Schlüsselrotation (Secrets)

### Zu rotierende Secrets (Phase 1)
- `NEXTAUTH_SECRET`
- `DATABASE_URL` / `DIRECT_URL` (DB-Credentials)
- `OPENAI_API_KEY`
- `RESEND_API_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

### Rotationsablauf (empfohlen)
1. Neues Secret beim Anbieter erzeugen.
2. In Netlify-Umgebung setzen (und lokal `.env` aktualisieren).
3. Falls nötig Gegenstück aktualisieren:
   - Stripe Webhook Secret im Webhook-Endpoint-Setup
4. Deploy auslösen.
5. Gesundheitscheck:
   - `/api/health`
   - Login
   - betroffene Funktion (z. B. Mailversand/Stripe-Checkout)
6. Altes Secret beim Anbieter deaktivieren/löschen.

### Verifikation nach Rotation
- `npm run env:check` lokal / in CI
- Smoke-Tests (mindestens öffentliche Pfade + Health)
- Manuelle Funktionsprüfung des betroffenen Integrationspfads

## 3. Backup / Wiederherstellung (Supabase)

## Ist-Stand (technisch)
- Datenbank auf Supabase Postgres
- Produktive Backup-/PITR-Fähigkeiten hängen vom Supabase-Plan/Projekt-Setup ab
- In AVV/TOMs genannte Aussagen müssen mit tatsächlichem Supabase-Plan abgeglichen werden

## Mindestprüfungen vor/kurz nach Go-Live
1. Supabase-Projekt: Backup/PITR-Status prüfen (Dashboard).
2. Verantwortlichkeit klären:
   - Plattform-Backup (Supabase)
   - App-seitige Export-/Recovery-Prozesse (Organisationsexport)
3. Test einer Wiederherstellungsstrategie planen (mind. Table-/Project-Level Vorgehen dokumentieren).

## Restore-Notizen (operativ)
- Bei Datenfehlern zuerst Auswirkung eingrenzen (welche `Organization`, welcher Zeitraum).
- Vor Restore prüfen, ob App-seitig Export/Transaktionshistorie ausreicht.
- Restore-Entscheidung nur nach Abwägung, da Multi-Tenant-Daten betroffen sein können.

## 4. Kommunikationsvorlagen (neutral, intern)

### Kundeninfo (technisch, ohne Schuldeingeständnis)
- Wir untersuchen derzeit eine technische Störung / einen Sicherheitsvorfall.
- Betroffene Funktionen: [...]
- Der Betrieb ist [eingeschränkt / wiederhergestellt].
- Nächste Aktualisierung bis: [Zeitpunkt]

### Interne Übergabe
- Was ist passiert?
- Was wurde bereits getan?
- Was ist noch offen?
- Wer entscheidet über Kundenkommunikation / weitere Maßnahmen?

## 5. Phase-1 Grenzen (bewusst)
- Kein vollständiges SIEM / zentrales Audit-Log
- Kein formalisierter 24/7 On-Call-Prozess
- Kein automatisiertes Secret-Rotation-Framework

