import path from "node:path";
import { fileURLToPath } from "node:url";

/** @type {import('next').NextConfig} */
const isDev = process.env.NODE_ENV !== "production";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function buildCsp() {
  const scriptSrc = ["'self'", "'unsafe-inline'"];
  if (isDev) scriptSrc.push("'unsafe-eval'");

  const connectSrc = [
    "'self'",
    "https://api.openai.com",
    "https://api.stripe.com",
    "https://checkout.stripe.com",
  ];
  if (isDev) {
    connectSrc.push("ws:", "wss:");
  }

  const directives = [
    "default-src 'self'",
    "base-uri 'self'",
    "form-action 'self' https://checkout.stripe.com",
    "frame-ancestors 'none'",
    "object-src 'none'",
    `script-src ${scriptSrc.join(" ")}`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' data: https://fonts.gstatic.com",
    "img-src 'self' data: blob:",
    `connect-src ${connectSrc.join(" ")}`,
    "frame-src 'self' https://js.stripe.com https://checkout.stripe.com",
  ];

  if (!isDev) {
    directives.push("upgrade-insecure-requests");
  }

  return directives.join("; ");
}

const securityHeaders = [
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "X-XSS-Protection",
    value: "0",
  },
  {
    key: "Permissions-Policy",
    value:
      "accelerometer=(), ambient-light-sensor=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(self), usb=()",
  },
  {
    key: "Content-Security-Policy",
    value: buildCsp(),
  },
  ...(!isDev
    ? [
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
      ]
    : []),
];

const nextConfig = {
  outputFileTracingRoot: __dirname,
  // ESM-Pakete die per dynamic import geladen werden
  experimental: {
    esmExternals: "loose",
  },
  // CSP-Headers für Sicherheit
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
  // Webpack-Konfiguration für @react-pdf/renderer (benötigt Canvas-Polyfill)
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;
  },
};

export default nextConfig;
