import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { login, logout, register } from "./auth.functions";
import { currentUserQueryOptions } from "./queries";
import type { LoginValues, RegisterValues } from "./schemas";
import type { SessionUser } from "./types";
import { cartActions } from "@/features/cart/cart-store";

export const homeForUser = (user: SessionUser) => (user.role === "admin" ? "/admin" : "/produtos");

const useOnAuthenticated = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  return async (user: SessionUser, redirectTo?: string) => {
    queryClient.setQueryData(currentUserQueryOptions().queryKey, user);
    await router.invalidate();
    const target = redirectTo?.startsWith("/") ? redirectTo : homeForUser(user);
    await router.navigate({ to: target });
  };
};

export const useLogin = (redirectTo?: string) => {
  const onAuthenticated = useOnAuthenticated();
  return useMutation({
    mutationFn: (data: LoginValues) => login({ data }),
    onSuccess: (user) => onAuthenticated(user, redirectTo),
  });
};

export const useRegister = (redirectTo?: string) => {
  const onAuthenticated = useOnAuthenticated();
  return useMutation({
    mutationFn: (data: RegisterValues) => register({ data }),
    onSuccess: (user) => onAuthenticated(user, redirectTo),
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: () => logout(),
    onSuccess: async () => {
      cartActions.clear();
      queryClient.clear();
      queryClient.setQueryData(currentUserQueryOptions().queryKey, null);
      await router.invalidate();
      await router.navigate({ to: "/" });
    },
  });
};
