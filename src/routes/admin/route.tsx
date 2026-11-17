import { createFileRoute, Outlet } from "@tanstack/react-router";
import { requireAdmin } from "@/features/auth/guards";

export const Route = createFileRoute("/admin")({
  beforeLoad: requireAdmin,
  component: Outlet,
});
