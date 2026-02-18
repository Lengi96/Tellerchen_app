import OpenAI from "openai";

const globalForOpenAI = globalThis as unknown as {
  openai: OpenAI | undefined;
};

// Lazy-Initialisierung: OpenAI-Client wird erst beim ersten Aufruf erstellt
// Verhindert Build-Fehler wenn OPENAI_API_KEY nicht gesetzt ist
export function getOpenAIClient(): OpenAI {
  if (globalForOpenAI.openai) {
    return globalForOpenAI.openai;
  }

  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  if (process.env.NODE_ENV !== "production") {
    globalForOpenAI.openai = client;
  }

  return client;
}
