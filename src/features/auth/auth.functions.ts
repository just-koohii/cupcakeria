import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { hashPassword, verifyPassword } from "./password.server";
import { validateLogin, validateRegister } from "./schemas";
import { endSession, getSessionUser, startSession } from "./session.server";
import type { SessionUser } from "./types";
import { getDb } from "@/db/client.server";
import { users } from "@/db/schema";
import { assertNoFieldErrors, FormValidationError } from "@/utils/form-errors";

export const getCurrentUser = createServerFn({ method: "GET" }).handler(
  async (): Promise<SessionUser | null> => getSessionUser(),
);

export const login = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    const { values, errors } = validateLogin(input);
    assertNoFieldErrors(errors);
    return values;
  })
  .handler(async ({ data }): Promise<SessionUser> => {
    const user = getDb().select().from(users).where(eq(users.email, data.email)).get();
    if (!user || !verifyPassword(data.password, user.passwordHash)) {
      throw new FormValidationError({ email: "", password: "E-mail ou senha inválidos." });
    }
    startSession(user.id);
    return { id: user.id, name: user.name, email: user.email, role: user.role };
  });

export const register = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    const { values, errors } = validateRegister(input);
    assertNoFieldErrors(errors);
    return values;
  })
  .handler(async ({ data }): Promise<SessionUser> => {
    const db = getDb();
    const existing = db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, data.email))
      .get();
    if (existing) {
      throw new FormValidationError({ email: "Já existe uma conta com este e-mail." });
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
