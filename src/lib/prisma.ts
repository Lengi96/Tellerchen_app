import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function getDatasourceUrl(): string | undefined {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) return undefined;

  // Supabase Transaction Pooler (Port 6543) benötigt PgBouncer-Kompatibilität.
  if (!databaseUrl.includes("pooler.supabase.com:6543")) {
    return databaseUrl;
  }

  try {
    const parsed = new URL(databaseUrl);
    if (!parsed.searchParams.has("pgbouncer")) {
      parsed.searchParams.set("pgbouncer", "true");
    }
    if (!parsed.searchParams.has("connection_limit")) {
      parsed.searchParams.set("connection_limit", "1");
    }
    return parsed.toString();
  } catch {
    return databaseUrl;
  }
}

const datasourceUrl = getDatasourceUrl();

// Singleton-Pattern: Verhindert mehrere Prisma-Instanzen im Development-Modus
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query"] : [],
    ...(datasourceUrl
      ? {
          datasources: {
            db: {
              url: datasourceUrl,
            },
          },
        }
      : {}),
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
