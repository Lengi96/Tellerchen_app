import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../init";

export const autonomyRouter = router({
  // Absprache + Audit-Log eines Patienten laden
  getByPatient: protectedProcedure
    .input(z.object({ patientId: z.string() }))
    .query(async ({ ctx, input }) => {
      // Sicherheitshinweis: Organization-Check
      const patient = await ctx.prisma.patient.findUnique({
        where: { id: input.patientId },
        select: { organizationId: true },
      });

      if (!patient || patient.organizationId !== ctx.organizationId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Zugriff verweigert.",
        });
      }

      const agreement = await ctx.prisma.autonomyAgreement.findUnique({
        where: { patientId: input.patientId },
        include: {
          createdByUser: { select: { name: true } },
        },
      });

      const auditLog = await ctx.prisma.autonomyAuditLog.findMany({
        where: { patientId: input.patientId },
        orderBy: { changedAt: "desc" },
        include: {
          changedByUser: { select: { name: true } },
        },
      });

      return { agreement, auditLog };
    }),

  // Absprache erstellen oder aktualisieren (mit Audit-Log)
  upsert: protectedProcedure
    .input(
      z.object({
        patientId: z.string(),
        canPortionSupervised: z.boolean(),
        canPortionIndependent: z.boolean(),
        notes: z.string().max(500).optional().nullable(),
        validFrom: z.coerce.date(),
        validUntil: z.coerce.date().optional().nullable(),
        reason: z
          .string()
          .min(10, "Begründung muss mindestens 10 Zeichen lang sein.")
          .max(500, "Begründung darf maximal 500 Zeichen lang sein."),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Sicherheitshinweis: Organization-Check
      const patient = await ctx.prisma.patient.findUnique({
        where: { id: input.patientId },
        select: { organizationId: true },
      });

      if (!patient || patient.organizationId !== ctx.organizationId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Zugriff verweigert.",
        });
      }

      // Validierung: Independent erfordert Supervised
      if (input.canPortionIndependent && !input.canPortionSupervised) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "Eigenständiges Portionieren erfordert, dass 'unter Aufsicht portionieren' ebenfalls aktiviert ist.",
        });
      }

      // Validierung: validUntil > validFrom
      if (input.validUntil && input.validUntil <= input.validFrom) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "'Gültig bis' muss nach 'Gültig ab' liegen.",
        });
      }

      const existing = await ctx.prisma.autonomyAgreement.findUnique({
        where: { patientId: input.patientId },
      });

      if (!existing) {
        // --- Erstanlage ---
        const agreement = await ctx.prisma.autonomyAgreement.create({
          data: {
            patientId: input.patientId,
            organizationId: ctx.organizationId,
            canPortionSupervised: input.canPortionSupervised,
            canPortionIndependent: input.canPortionIndependent,
            notes: input.notes || null,
            validFrom: input.validFrom,
            validUntil: input.validUntil || null,
            createdBy: ctx.user.id,
          },
        });

        // Ein "CREATED" Audit-Log-Eintrag
        await ctx.prisma.autonomyAuditLog.create({
          data: {
            patientId: input.patientId,
            agreementId: agreement.id,
            changedBy: ctx.user.id,
            fieldChanged: "CREATED",
            oldValue: "—",
            newValue: "Absprache erstellt",
            reason: input.reason,
          },
        });

        return agreement;
      }

      // --- Update: Diff berechnen und Audit-Log-Einträge ---
      type DiffField = {
        field: string;
        oldVal: string;
        newVal: string;
      };

      const diffs: DiffField[] = [];

      if (existing.canPortionSupervised !== input.canPortionSupervised) {
        diffs.push({
          field: "canPortionSupervised",
          oldVal: String(existing.canPortionSupervised),
          newVal: String(input.canPortionSupervised),
        });
      }

      if (existing.canPortionIndependent !== input.canPortionIndependent) {
        diffs.push({
          field: "canPortionIndependent",
          oldVal: String(existing.canPortionIndependent),
          newVal: String(input.canPortionIndependent),
        });
      }

      const oldNotes = existing.notes ?? "";
      const newNotes = input.notes ?? "";
      if (oldNotes !== newNotes) {
        diffs.push({
          field: "notes",
          oldVal: oldNotes || "—",
          newVal: newNotes || "—",
        });
      }

      if (existing.validFrom.toISOString() !== input.validFrom.toISOString()) {
        diffs.push({
          field: "validFrom",
          oldVal: existing.validFrom.toISOString().slice(0, 10),
          newVal: input.validFrom.toISOString().slice(0, 10),
        });
      }

      const oldUntil = existing.validUntil?.toISOString().slice(0, 10) ?? "unbefristet";
      const newUntil = input.validUntil?.toISOString().slice(0, 10) ?? "unbefristet";
      if (oldUntil !== newUntil) {
        diffs.push({
          field: "validUntil",
          oldVal: oldUntil,
          newVal: newUntil,
        });
      }

      if (diffs.length === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Keine Änderungen erkannt.",
        });
      }

      // Alles in einer Transaktion
      const updated = await ctx.prisma.$transaction(async (tx) => {
        const agreement = await tx.autonomyAgreement.update({
          where: { patientId: input.patientId },
          data: {
            canPortionSupervised: input.canPortionSupervised,
            canPortionIndependent: input.canPortionIndependent,
            notes: input.notes || null,
            validFrom: input.validFrom,
            validUntil: input.validUntil || null,
          },
        });

        // Für jedes geänderte Feld einen Audit-Log-Eintrag
        await tx.autonomyAuditLog.createMany({
          data: diffs.map((d) => ({
            patientId: input.patientId,
            agreementId: agreement.id,
            changedBy: ctx.user.id,
            fieldChanged: d.field,
            oldValue: d.oldVal,
            newValue: d.newVal,
            reason: input.reason,
          })),
        });

        return agreement;
      });

      return updated;
    }),
});
