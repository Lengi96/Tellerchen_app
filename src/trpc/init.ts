import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { auth } from "@/server/auth";
import { prisma } from "@/lib/prisma";

// Kontext-Typ für alle tRPC-Prozeduren
export async function createContext() {
  const session = await auth();

  return {
    session,
    prisma,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape }) {
    return shape;
  },
});

export const router = t.router;
export const publicProcedure = t.procedure;

// Sicherheitshinweis: protectedProcedure prüft ob ein gültiger User eingeloggt ist
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Sie müssen eingeloggt sein, um diese Aktion durchzuführen.",
    });
  }

  return next({
    ctx: {
      session: ctx.session,
      user: ctx.session.user,
      organizationId: ctx.session.user.organizationId,
    },
  });
});

// Sicherheitshinweis: adminProcedure prüft zusätzlich ob der User ADMIN-Rechte hat
export const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (ctx.user.role !== "ADMIN") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Diese Aktion ist nur für Administratoren zugänglich.",
    });
  }

  return next({ ctx });
});
