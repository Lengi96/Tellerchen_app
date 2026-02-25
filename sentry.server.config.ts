import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Tracing: 10 % der Server-Requests
  tracesSampleRate: 0.1,

  debug: false,
});
