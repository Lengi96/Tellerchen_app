import { router } from "../init";
import { patientsRouter } from "./patients";
import { mealPlansRouter } from "./mealPlans";
import { shoppingListRouter } from "./shoppingList";
import { organizationRouter } from "./organization";

export const appRouter = router({
  patients: patientsRouter,
  mealPlans: mealPlansRouter,
  shoppingList: shoppingListRouter,
  organization: organizationRouter,
});

export type AppRouter = typeof appRouter;
