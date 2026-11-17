import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { hashPassword, verifyPassword } from "./password.server";
import { endSession, getSessionUser, startSession } from "./session.server";
import type { SessionUser } from "./types";
import { getDb } from "@/db/client.server";
import { users } from "@/db/schema";
import { asRecord, isEmailLike, requiredString } from "@/utils/validation";

export const getCurrentUser = createServerFn({ method: "GET" }).handler(
  async (): Promise<SessionUser | null> => getSessionUser(),
);

export const login = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    const data = asRecord(input);
    return {
      email: requiredString(data.email, "E-mail", { max: 200 }).toLowerCase(),
      password: requiredString(data.password, "Senha", { max: 200 }),
    };
  })
  .handler(async ({ data }): Promise<SessionUser> => {
    const user = getDb().select().from(users).where(eq(users.email, data.email)).get();
    if (!user || !verifyPassword(data.password, user.passwordHash)) {
      throw new Error("E-mail ou senha inválidos.");
    }
    startSession(user.id);
    return { id: user.id, name: user.name, email: user.email, role: user.role };
  });

export const register = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    const data = asRecord(input);
    const email = requiredString(data.email, "E-mail", { max: 200 }).toLowerCase();
    if (!isEmailLike(email)) {
      throw new Error("Informe um e-mail válido.");
    }
    return {
      name: requiredString(data.name, "Nome", { min: 2, max: 120 }),
      email,
      password: requiredString(data.password, "Senha", { min: 6, max: 200 }),
    };
  })
  .handler(async ({ data }): Promise<SessionUser> => {
    const db = getDb();
    const existing = db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, data.email))
      .get();
    if (existing) {
      throw new Error("Já existe uma conta com este e-mail.");
    }
    const user = db
      .insert(users)
      .values({
        name: data.name,
        email: data.email,
        passwordHash: hashPassword(data.password),
        role: "customer",
        createdAt: new Date(),
      })
      .returning()
      .get();
    startSession(user.id);
    return { id: user.id, name: user.name, email: user.email, role: user.role };
  });

export const logout = createServerFn({ method: "POST" }).handler(async () => {
  endSession();
  return { ok: true };
});
