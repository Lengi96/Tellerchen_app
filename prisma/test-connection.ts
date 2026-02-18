import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  try {
    const result = await prisma.$queryRawUnsafe("SELECT 1 as test");
    console.log("Verbindung erfolgreich!", result);

    // Prüfe ob Tabellen existieren
    const tables = await prisma.$queryRawUnsafe(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    console.log("Tabellen:", tables);

    // Prüfe ob Seed-Daten da sind
    const orgCount = await prisma.organization.count();
    const userCount = await prisma.user.count();
    const patientCount = await prisma.patient.count();
    console.log(`Daten: ${orgCount} Org, ${userCount} User, ${patientCount} Patienten`);
  } catch (e: any) {
    console.error("Fehler:", e.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
