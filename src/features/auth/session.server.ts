import { createHmac, timingSafeEqual } from "node:crypto";
import { deleteCookie, getCookie, setCookie } from "@tanstack/react-start/server";
import { eq } from "drizzle-orm";
import type { SessionUser } from "./types";
import { getDb, getDbInfo } from "@/db/client.server";
import { users } from "@/db/schema";

const COOKIE_NAME = "cupcake_session";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

const DEV_FALLBACK_SECRET = "cupcake-dev-secret-change-me";

const getSecret = () => {
  const secret = process.env.SESSION_SECRET;
  if (!secret && process.env.NODE_ENV === "production") {
    // biome-ignore lint/suspicious/noConsole: mandatory warning
    console.warn("[auth] SESSION_SECRET não definido — usando segredo de desenvolvimento.");
  }
  return secret || DEV_FALLBACK_SECRET;
};

interface SessionPayload {
  uid: number;
  epoch: number;
  exp: number;
}

const sign = (value: string) => createHmac("sha256", getSecret()).update(value).digest("base64url");

const encode = (payload: SessionPayload) => {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${sign(body)}`;
};

const decode = (token: string): SessionPayload | null => {
  const [body, signature] = token.split(".");
  if (!body || !signature) {
    return null;
  }
  const expected = Buffer.from(sign(body));
  const received = Buffer.from(signature);
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) {
    return null;
  }
  try {
    return JSON.parse(Buffer.from(body, "base64url").toString()) as SessionPayload;
  } catch {
    return null;
  }
};

export const startSession = (userId: number) => {
  const token = encode({
    uid: userId,
    epoch: getDbInfo().epoch,
    exp: Date.now() + SESSION_TTL_MS,
  });
  setCookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  });
};

export const endSession = () => {
  deleteCookie(COOKIE_NAME, { path: "/" });
};

export const getSessionUser = (): SessionUser | null => {
  const token = getCookie(COOKIE_NAME);
  if (!token) {
    return null;
  }
  const payload = decode(token);
  if (!payload || payload.exp < Date.now() || payload.epoch !== getDbInfo().epoch) {
    return null;
  }
  const user = getDb()
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
    })
    .from(users)
    .where(eq(users.id, payload.uid))
    .get();
  return user ?? null;
};
