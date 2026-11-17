import { createFileRoute } from "@tanstack/react-router";
import { RegisterForm } from "@/features/auth/components/register-form";
import { parseRedirect, redirectIfAuthenticated } from "@/features/auth/guards";

export const Route = createFileRoute("/cadastro")({
  validateSearch: (search: Record<string, unknown>): { redirect?: string } => ({
    redirect: parseRedirect(search.redirect),
  }),
  beforeLoad: redirectIfAuthenticated,
  head: () => ({ meta: [{ title: "Criar conta | Cupcakeria" }] }),
  component: RegisterRoute,
});

function RegisterRoute() {
  const { redirect } = Route.useSearch();
  return (
    <div className="flex justify-center py-6">
      <RegisterForm redirectTo={redirect} />
    </div>
  );
}
