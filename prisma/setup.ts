import { PrismaClient } from "@prisma/client";

// Dieses Script erstellt die Tabellen direkt über die Pooler-Verbindung
const prisma = new PrismaClient();

async function main() {
  console.log("Erstelle Tabellen via SQL...");

  await prisma.$executeRawUnsafe(`
    -- Enum für Rollen
    DO $$ BEGIN
      CREATE TYPE "Role" AS ENUM ('ADMIN', 'STAFF');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;

    -- Organization
    CREATE TABLE IF NOT EXISTS "Organization" (
      "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
      "name" TEXT NOT NULL,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
    );

    -- User
    CREATE TABLE IF NOT EXISTS "User" (
      "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
      "organizationId" TEXT NOT NULL,
      "email" TEXT NOT NULL,
      "passwordHash" TEXT NOT NULL,
      "name" TEXT NOT NULL,
      "role" "Role" NOT NULL DEFAULT 'STAFF',
      "isActive" BOOLEAN NOT NULL DEFAULT true,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "User_pkey" PRIMARY KEY ("id")
    );

    -- Patient
    CREATE TABLE IF NOT EXISTS "Patient" (
      "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
      "organizationId" TEXT NOT NULL,
      "pseudonym" TEXT NOT NULL,
      "birthYear" INTEGER NOT NULL,
      "currentWeight" DECIMAL(5,2) NOT NULL,
      "targetWeight" DECIMAL(5,2) NOT NULL,
      "allergies" TEXT[] DEFAULT '{}',
      "notes" TEXT,
      "isActive" BOOLEAN NOT NULL DEFAULT true,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "createdBy" TEXT NOT NULL,
      CONSTRAINT "Patient_pkey" PRIMARY KEY ("id")
    );

    -- WeightEntry
    CREATE TABLE IF NOT EXISTS "WeightEntry" (
      "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
      "patientId" TEXT NOT NULL,
      "weightKg" DECIMAL(5,2) NOT NULL,
      "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "recordedBy" TEXT NOT NULL,
      CONSTRAINT "WeightEntry_pkey" PRIMARY KEY ("id")
    );

    -- MealPlan
    CREATE TABLE IF NOT EXISTS "MealPlan" (
      "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
      "patientId" TEXT NOT NULL,
      "weekStart" TIMESTAMP(3) NOT NULL,
      "planJson" JSONB NOT NULL,
      "totalKcal" INTEGER NOT NULL,
      "promptUsed" TEXT NOT NULL,
      "createdBy" TEXT NOT NULL,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "MealPlan_pkey" PRIMARY KEY ("id")
    );

    -- ShoppingList
    CREATE TABLE IF NOT EXISTS "ShoppingList" (
      "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
      "mealPlanId" TEXT NOT NULL,
      "itemsJson" JSONB NOT NULL,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "ShoppingList_pkey" PRIMARY KEY ("id")
    );
  `);

  // Unique Constraints und Indices
  await prisma.$executeRawUnsafe(`
    -- Unique constraints
    CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");
    CREATE UNIQUE INDEX IF NOT EXISTS "ShoppingList_mealPlanId_key" ON "ShoppingList"("mealPlanId");

    -- Indices
    CREATE INDEX IF NOT EXISTS "User_organizationId_idx" ON "User"("organizationId");
    CREATE INDEX IF NOT EXISTS "User_email_idx" ON "User"("email");
    CREATE INDEX IF NOT EXISTS "Patient_organizationId_idx" ON "Patient"("organizationId");
    CREATE INDEX IF NOT EXISTS "WeightEntry_patientId_idx" ON "WeightEntry"("patientId");
    CREATE INDEX IF NOT EXISTS "MealPlan_patientId_idx" ON "MealPlan"("patientId");
    CREATE INDEX IF NOT EXISTS "MealPlan_createdBy_idx" ON "MealPlan"("createdBy");
  `);

  // Foreign Keys
  await prisma.$executeRawUnsafe(`
    DO $$ BEGIN
      ALTER TABLE "User" ADD CONSTRAINT "User_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    EXCEPTION WHEN duplicate_object THEN null; END $$;

    DO $$ BEGIN
      ALTER TABLE "Patient" ADD CONSTRAINT "Patient_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    EXCEPTION WHEN duplicate_object THEN null; END $$;

    DO $$ BEGIN
      ALTER TABLE "WeightEntry" ADD CONSTRAINT "WeightEntry_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    EXCEPTION WHEN duplicate_object THEN null; END $$;

    DO $$ BEGIN
      ALTER TABLE "MealPlan" ADD CONSTRAINT "MealPlan_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    EXCEPTION WHEN duplicate_object THEN null; END $$;

    DO $$ BEGIN
      ALTER TABLE "MealPlan" ADD CONSTRAINT "MealPlan_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    EXCEPTION WHEN duplicate_object THEN null; END $$;

    DO $$ BEGIN
      ALTER TABLE "ShoppingList" ADD CONSTRAINT "ShoppingList_mealPlanId_fkey" FOREIGN KEY ("mealPlanId") REFERENCES "MealPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    EXCEPTION WHEN duplicate_object THEN null; END $$;
  `);

  console.log("Tabellen erfolgreich erstellt!");
}

main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
