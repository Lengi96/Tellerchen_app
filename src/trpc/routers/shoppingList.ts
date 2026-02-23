import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../init";
import type { MealPlanData } from "@/lib/openai/nutritionPrompt";
import type { Prisma } from "@prisma/client";

interface AggregatedItem {
  name: string;
  amount: number;
  unit: string;
  category: string;
}

// Zutaten aus dem Plan aggregieren und nach Kategorie gruppieren
function aggregateIngredients(planData: MealPlanData): Record<string, AggregatedItem[]> {
  const ingredientMap = new Map<string, AggregatedItem>();

  for (const day of planData.days) {
    for (const meal of day.meals) {
      for (const ingredient of meal.ingredients) {
        const key = `${ingredient.name.toLowerCase()}_${ingredient.unit}`;
        const existing = ingredientMap.get(key);

        if (existing) {
          existing.amount += ingredient.amount;
        } else {
          ingredientMap.set(key, {
            name: ingredient.name,
            amount: ingredient.amount,
            unit: ingredient.unit,
            category: ingredient.category,
          });
        }
      }
    }
  }

  // Nach Kategorie gruppieren
  const grouped: Record<string, AggregatedItem[]> = {
    "Gemüse & Obst": [],
    Protein: [],
    Milchprodukte: [],
    Kohlenhydrate: [],
    Sonstiges: [],
  };

  for (const item of Array.from(ingredientMap.values())) {
    const category = grouped[item.category] ? item.category : "Sonstiges";
    grouped[category].push({
      ...item,
      amount: Math.round(item.amount),
    });
  }

  // Alphabetisch innerhalb der Kategorien sortieren
  for (const category of Object.keys(grouped)) {
    grouped[category].sort((a, b) => a.name.localeCompare(b.name, "de"));
  }

  return grouped;
}

export const shoppingListRouter = router({
  // Einkaufsliste aus Ernährungsplan generieren
  generateFromPlan: protectedProcedure
    .input(z.object({ mealPlanId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const mealPlan = await ctx.prisma.mealPlan.findUnique({
        where: { id: input.mealPlanId },
        include: {
          patient: {
            select: { organizationId: true },
          },
          shoppingList: true,
        },
      });

      if (!mealPlan) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Ernährungsplan nicht gefunden.",
        });
      }

      // Sicherheitshinweis: Organization-Check
      if (mealPlan.patient.organizationId !== ctx.organizationId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Zugriff verweigert.",
        });
      }

      // Falls bereits eine Einkaufsliste existiert, diese zurückgeben
      if (mealPlan.shoppingList) {
        return mealPlan.shoppingList;
      }

      // Zutaten aggregieren
      const planData = mealPlan.planJson as unknown as MealPlanData;
      const groupedItems = aggregateIngredients(planData);

      // In DB speichern
      const shoppingList = await ctx.prisma.shoppingList.create({
        data: {
          mealPlanId: input.mealPlanId,
          itemsJson: groupedItems as unknown as Prisma.InputJsonValue,
        },
      });

      return shoppingList;
    }),

  // Einkaufsliste anhand des MealPlans laden
  getByMealPlan: protectedProcedure
    .input(z.object({ mealPlanId: z.string() }))
    .query(async ({ ctx, input }) => {
      const shoppingList = await ctx.prisma.shoppingList.findUnique({
        where: { mealPlanId: input.mealPlanId },
        include: {
          mealPlan: {
            include: {
              patient: {
                select: { organizationId: true, pseudonym: true },
              },
            },
          },
        },
      });

      if (!shoppingList) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Einkaufsliste nicht gefunden.",
        });
      }

      // Sicherheitshinweis: Organization-Check
      if (shoppingList.mealPlan.patient.organizationId !== ctx.organizationId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Zugriff verweigert.",
        });
      }

      return shoppingList;
    }),

  // Alle Einkaufslisten der eigenen Organisation
  list: protectedProcedure
    .input(
      z
        .object({
          limit: z.number().int().min(1).max(200).default(50),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      return ctx.prisma.shoppingList.findMany({
        where: {
          mealPlan: {
            is: {
              patient: {
                is: {
                  organizationId: ctx.organizationId,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: input?.limit ?? 50,
        include: {
          mealPlan: {
            select: {
              id: true,
              planJson: true,
              weekStart: true,
              patient: {
                select: {
                  id: true,
                  pseudonym: true,
                },
              },
              createdByUser: {
                select: { name: true },
              },
            },
          },
        },
      });
    }),

  // Einkaufsliste anhand der eigenen ID laden
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const shoppingList = await ctx.prisma.shoppingList.findUnique({
        where: { id: input.id },
        include: {
          mealPlan: {
            include: {
              patient: {
                select: { organizationId: true, pseudonym: true },
              },
              createdByUser: {
                select: { name: true },
              },
            },
          },
        },
      });

      if (!shoppingList) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Einkaufsliste nicht gefunden.",
        });
      }

      if (shoppingList.mealPlan.patient.organizationId !== ctx.organizationId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Zugriff verweigert.",
        });
      }

      return shoppingList;
    }),

  // Einkaufsliste löschen
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const shoppingList = await ctx.prisma.shoppingList.findUnique({
        where: { id: input.id },
        include: {
          mealPlan: {
            include: {
              patient: {
                select: { organizationId: true },
              },
            },
          },
        },
      });

      if (!shoppingList) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Einkaufsliste nicht gefunden.",
        });
      }

      if (shoppingList.mealPlan.patient.organizationId !== ctx.organizationId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Zugriff verweigert.",
        });
      }

      await ctx.prisma.shoppingList.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),
});

