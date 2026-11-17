import { queryOptions, useQuery } from "@tanstack/react-query";
import { getCurrentUser } from "./auth.functions";

export const currentUserQueryOptions = () =>
  queryOptions({
    queryKey: ["auth", "current-user"],
    queryFn: () => getCurrentUser(),
    staleTime: 60 * 1000,
  });

export const useCurrentUser = () => useQuery(currentUserQueryOptions()).data ?? null;
