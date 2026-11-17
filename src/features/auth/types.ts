import type { UserRole } from "@/db/enums";

export interface SessionUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}
