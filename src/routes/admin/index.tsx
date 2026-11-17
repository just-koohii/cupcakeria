import { createFileRoute } from "@tanstack/react-router";
import { DashboardPage } from "@/features/admin-dashboard/components/dashboard-page";
import { dashboardQueryOptions } from "@/features/admin-dashboard/queries";

export const Route = createFileRoute("/admin/")({
  loader: ({ context }) => context.queryClient.query(dashboardQueryOptions()),
  head: () => ({ meta: [{ title: "Dashboard | Cupcakeria" }] }),
  component: DashboardPage,
});
