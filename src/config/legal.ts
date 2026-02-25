export const LEGAL = {
  brandName: "mein-nutrikompass.de",
  domain: "mein-nutrikompass.de",
  operator: {
    name: "Christoph Lengowski",
    addressLine1: "Adreystraße 116",
    postalCode: "44225",
    city: "Dortmund",
    country: "Deutschland",
    email: "c.lengowski@yahoo.de",
    phone: "015111851677",
  },
  commercial: {
    tradeRegister: "Keine Eintragung",
    registerCourt: "Entfällt",
    vatNotice: "Gemäß § 19 UStG wird keine Umsatzsteuer ausgewiesen.",
  },
  responseTargets: {
    demoBusinessDays: "1 Werktag",
    avvCounterSignedBusinessDays: "2 Werktage",
  },
  mailSubjects: {
    demoRequest: "Demo-Anfrage mein-nutrikompass.de",
    avvRequest: "AVV-Anfrage mein-nutrikompass.de",
    avvExecution: "AVV-Abschluss mein-nutrikompass.de",
  },
} as const;

export function legalMailto(subject: string): string {
  return `mailto:${LEGAL.operator.email}?subject=${encodeURIComponent(subject)}`;
}

