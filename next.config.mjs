/** @type {import('next').NextConfig} */
const nextConfig = {
  // ESM-Pakete die per dynamic import geladen werden
  experimental: {
    esmExternals: "loose",
  },
  // CSP-Headers für Sicherheit
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
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
            value: "1; mode=block",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob:",
              "connect-src 'self' https://api.openai.com",
            ].join("; "),
          },
        ],
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
