import { createFileRoute, Outlet } from "@tanstack/react-router";
import { requireCustomer } from "@/features/auth/guards";

export const Route = createFileRoute("/_cliente")({
  beforeLoad: requireCustomer,
  component: Outlet,
});
