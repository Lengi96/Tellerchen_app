import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Tracing: nur 10 % der Transaktionen sampeln (kosteneffizient)
  tracesSampleRate: 0.1,

  // Replay: 1 % aller Sessions, 100 % bei Fehler
  replaysSessionSampleRate: 0.01,
  replaysOnErrorSampleRate: 1.0,

  // Keine Sourcemaps-URLs in Production nach außen
  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],

  // Debug nur in Entwicklung
  debug: false,
});
