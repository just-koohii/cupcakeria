import type { QueryClient } from "@tanstack/react-query";
import { redirect } from "@tanstack/react-router";
import { currentUserQueryOptions } from "./queries";

interface GuardArgs {
  context: { queryClient: QueryClient };
  location: { href: string };
}

const loadUser = (queryClient: QueryClient) => queryClient.query(currentUserQueryOptions());

export const requireCustomer = async ({ context, location }: GuardArgs) => {
  const user = await loadUser(context.queryClient);
  if (!user) {
    throw redirect({ to: "/login", search: { redirect: location.href } });
  }
  if (user.role !== "customer") {
    throw redirect({ to: "/admin" });
  }
  return { user };
};

export const requireAdmin = async ({ context, location }: GuardArgs) => {
  const user = await loadUser(context.queryClient);
  if (!user) {
    throw redirect({ to: "/login", search: { redirect: location.href } });
  }
  if (user.role !== "admin") {
    throw redirect({ to: "/" });
  }
  return { user };
};

export const redirectIfAuthenticated = async ({ context }: Pick<GuardArgs, "context">) => {
  const user = await loadUser(context.queryClient);
  if (user) {
    throw redirect({ to: user.role === "admin" ? "/admin" : "/produtos" });
  }
};

export const parseRedirect = (value: unknown) =>
  typeof value === "string" && value.startsWith("/") && !value.startsWith("//") ? value : undefined;
