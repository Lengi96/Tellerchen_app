import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, adminProcedure } from "../init";

export const organizationRouter = router({
  get: adminProcedure.query(async ({ ctx }) => {
    const organization = await ctx.prisma.organization.findUnique({
      where: { id: ctx.organizationId },
      select: {
        id: true,
        name: true,
        createdAt: true,
      },
    });

    if (!organization) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Einrichtung nicht gefunden.",
      });
    }

    return organization;
  }),

  updateName: adminProcedure
    .input(
      z.object({
        name: z
          .string()
          .trim()
          .min(2, "Der Einrichtungsname muss mindestens 2 Zeichen lang sein.")
          .max(120, "Der Einrichtungsname darf maximal 120 Zeichen lang sein."),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.organization.update({
        where: { id: ctx.organizationId },
        data: { name: input.name },
        select: {
          id: true,
          name: true,
          createdAt: true,
        },
      });
    }),
});
