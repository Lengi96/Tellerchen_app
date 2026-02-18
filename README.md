# NutriKompass

KI-gestuetzte Ernaehrungsplanung fuer Einrichtungen, die Jugendliche mit Essstoerungen betreuen.

## Features

- Individuelle 7-Tage-Ernaehrungsplaene
- Automatische Einkaufslisten
- PDF-Export fuer Plaene und Listen
- Dashboard fuer Patienten, Plaene und Organisation
- Authentifizierung mit NextAuth
- Datenpersistenz mit Prisma + PostgreSQL (z. B. Supabase)

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- tRPC
- Prisma
- NextAuth
- Tailwind CSS
- OpenAI API

## Voraussetzungen

- Node.js 20+
- npm 10+
- PostgreSQL-Datenbank
- OpenAI API Key

## Setup (lokal)

1. Abhaengigkeiten installieren:
```bash
npm install
```

2. Umgebungsvariablen setzen:
```bash
cp .env.example .env
```
Dann Werte in `.env` eintragen.

3. Prisma-Client generieren:
```bash
npm run db:generate
```

4. Datenbank migrieren (dev):
```bash
npm run db:migrate
```

5. Dev-Server starten:
```bash
npm run dev
```

App: `http://localhost:3000`

## Verfuegbare Scripts

- `npm run dev` - Next.js Dev Server
- `npm run build` - Production Build
- `npm run start` - Production Server
- `npm run lint` - ESLint
- `npm run db:generate` - Prisma Client generieren
- `npm run db:migrate` - Prisma Migrationen (dev)
- `npm run db:push` - Schema in DB pushen
- `npm run db:seed` - Seed Script ausfuehren
- `npm run db:studio` - Prisma Studio

## Sicherheit & Datenschutz

- Keine echten Patientennamen im Klartext verwenden
- API-Keys niemals committen
- Vor Deployment produktive Secrets setzen

## Contributing

Bitte lies zuerst `CONTRIBUTING.md`.

## Lizenz

Dieses Projekt steht unter der MIT-Lizenz. Siehe `LICENSE`.
