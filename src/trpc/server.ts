import "server-only";

import { createContext } from "./init";
import { appRouter } from "./routers/_app";

// Server-seitiger tRPC-Caller für Server Components
export const serverApi = appRouter.createCaller(createContext);
