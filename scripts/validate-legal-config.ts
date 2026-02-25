import { LEGAL } from "../src/config/legal.ts";

type Check = { label: string; value: string };

const checks: Check[] = [
  { label: "brandName", value: LEGAL.brandName },
  { label: "domain", value: LEGAL.domain },
  { label: "operator.name", value: LEGAL.operator.name },
  { label: "operator.addressLine1", value: LEGAL.operator.addressLine1 },
  { label: "operator.postalCode", value: LEGAL.operator.postalCode },
  { label: "operator.city", value: LEGAL.operator.city },
  { label: "operator.country", value: LEGAL.operator.country },
  { label: "operator.email", value: LEGAL.operator.email },
  { label: "operator.phone", value: LEGAL.operator.phone },
  { label: "commercial.tradeRegister", value: LEGAL.commercial.tradeRegister },
  { label: "commercial.registerCourt", value: LEGAL.commercial.registerCourt },
  { label: "commercial.vatNotice", value: LEGAL.commercial.vatNotice },
];

const placeholderPattern =
  /\b(todo|placeholder|muster|beispiel|example|changeme|tbd)\b/i;

const errors: string[] = [];

for (const check of checks) {
  const normalized = check.value.trim();
  if (!normalized) {
    errors.push(`${check.label} darf nicht leer sein.`);
    continue;
  }
  if (placeholderPattern.test(normalized)) {
    errors.push(`${check.label} enthält einen Platzhalterwert: "${check.value}"`);
  }
}

if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(LEGAL.operator.email)) {
  errors.push("operator.email ist keine gültige E-Mail-Adresse.");
}

if (!/^[0-9+\s()/.-]{6,}$/.test(LEGAL.operator.phone)) {
  errors.push("operator.phone ist nicht plausibel formatiert.");
}

if (!/^\d{5}$/.test(LEGAL.operator.postalCode)) {
  errors.push("operator.postalCode muss eine 5-stellige deutsche PLZ sein.");
}

if (errors.length > 0) {
  console.error("Legal-Config-Validierung fehlgeschlagen:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log("Legal-Config validiert.");
