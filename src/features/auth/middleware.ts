import { createMiddleware } from "@tanstack/react-start";
import { getSessionUser } from "./session.server";

export const authMiddleware = createMiddleware({ type: "function" }).server(async ({ next }) => {
  const user = getSessionUser();
  if (!user) {
    throw new Error("Você precisa estar logado para continuar.");
  }
  return next({ context: { user } });
});

export const customerMiddleware = createMiddleware({ type: "function" })
  .middleware([authMiddleware])
  .server(async ({ next, context }) => {
    if (context.user.role !== "customer") {
      throw new Error("Esta ação é exclusiva para clientes.");
    }
    return next();
  });

export const adminMiddleware = createMiddleware({ type: "function" })
  .middleware([authMiddleware])
  .server(async ({ next, context }) => {
    if (context.user.role !== "admin") {
      throw new Error("Acesso restrito ao administrador.");
    }
    return next();
  });
