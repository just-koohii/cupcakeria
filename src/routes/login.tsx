import { createFileRoute } from "@tanstack/react-router";
import { LoginForm } from "@/features/auth/components/login-form";
import { parseRedirect, redirectIfAuthenticated } from "@/features/auth/guards";

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>): { redirect?: string } => ({
    redirect: parseRedirect(search.redirect),
  }),
  beforeLoad: redirectIfAuthenticated,
  head: () => ({ meta: [{ title: "Entrar | Cupcakeria" }] }),
  component: LoginRoute,
});

function LoginRoute() {
  const { redirect } = Route.useSearch();
  return (
    <div className="flex justify-center py-6">
      <LoginForm redirectTo={redirect} />
    </div>
  );
}
