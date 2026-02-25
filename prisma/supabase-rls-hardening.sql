-- ============================================================
-- Supabase RLS hardening for public tables (Prisma-managed schema)
-- Safe to run multiple times in the Supabase SQL Editor.
-- ============================================================

ALTER TABLE public."WeightEntry" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Patient" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."MealPlan" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."ShoppingList" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Organization" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."AutonomyAuditLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."AutonomyAgreement" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."StaffInvitation" ENABLE ROW LEVEL SECURITY;

-- Optional verification (run separately):
-- SELECT schemaname, tablename, rowsecurity
-- FROM pg_tables
-- WHERE schemaname = 'public'
--   AND tablename IN (
--     'WeightEntry', 'Patient', 'MealPlan', 'ShoppingList', 'Organization',
--     'AutonomyAuditLog', 'User', 'AutonomyAgreement', 'StaffInvitation'
--   );
