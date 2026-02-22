/**
 * Zentrale UI-Texte für konsistentes Gendern und Terminologie.
 * Prisma-Schema und tRPC-Router-Namen bleiben unverändert (Breaking Change vermeiden).
 * Nur UI-Labels und Nutzer-sichtbare Texte werden hier zentralisiert.
 */
export const STRINGS = {
  patient: {
    singular: "Bewohner:in",
    plural: "Bewohner:innen",
    add: "Neue Bewohner:in anlegen",
    empty: "Noch keine Bewohner:innen erfasst",
    search: "Nach Pseudonym suchen...",
    notFound: "Bewohner:in nicht gefunden",
    select: "Bewohner:in auswählen",
    active: "Aktive Bewohner:innen",
    details: "Bewohner:in-Details",
    overview: "Übersicht aller betreuten Personen",
    noPlan: "Noch kein Plan",
    lastPlan: "Letzter Plan",
  },
  staff: {
    singular: "Mitarbeiter:in",
    plural: "Mitarbeiter:innen",
    manage: "Mitarbeiter:innen verwalten",
    invite: "Mitarbeiter:in einladen",
    admin: "Administrator:in",
  },
  mealPlan: {
    singular: "Ernährungsplan",
    plural: "Ernährungspläne",
    generate: "Plan generieren",
    generateAll: "Pläne für alle generieren",
    create: "Neuen Plan erstellen",
    noPlanYet: "Noch keine Ernährungspläne erstellt",
  },
  shoppingList: {
    singular: "Einkaufsliste",
    plural: "Einkaufslisten",
    weekly: "Wocheneinkaufsliste",
    combined: "Gesamteinkaufsliste",
  },
  general: {
    teamNotes: "Notizen für das Team",
    createdBy: "Erstellt von",
    actions: "Aktionen",
    view: "Ansehen",
    edit: "Bearbeiten",
    delete: "Löschen",
    save: "Speichern",
    cancel: "Abbrechen",
    loading: "Wird geladen...",
    noData: "Keine Daten vorhanden",
  },
} as const;
