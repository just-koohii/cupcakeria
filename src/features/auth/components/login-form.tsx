import { Link } from "@tanstack/react-router";
import type { FormEvent } from "react";
import { validateLogin } from "../schemas";
import { useLogin } from "../use-auth-actions";
import { FormField } from "@/components/form-field";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { useFieldErrors } from "@/hooks/use-field-errors";
import { getFieldErrors, getFormErrorMessage, hasFieldErrors } from "@/utils/form-errors";

export const LoginForm = ({ redirectTo }: { redirectTo?: string }) => {
  const mutation = useLogin(redirectTo);
  const { errors, setErrors, clearError } = useFieldErrors();

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const { values, errors: found } = validateLogin(
      Object.fromEntries(new FormData(event.currentTarget)),
    );
    setErrors(found);
    if (hasFieldErrors(found)) {
      return;
    }
    mutation.mutate(values, { onError: (error) => setErrors(getFieldErrors(error)) });
  };

  const formError = getFormErrorMessage(mutation.error);

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-xl">Entrar</CardTitle>
        <CardDescription>
          Acesse sua conta para fazer pedidos e acompanhar entregas.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} noValidate>
          <FieldGroup>
            {formError && (
              <Alert variant="destructive">
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            )}
            <FormField
              label="E-mail"
              name="email"
              type="email"
              autoComplete="email"
              error={errors.email}
              onFieldChange={clearError}
            />
            <FormField
              label="Senha"
              name="password"
              type="password"
              autoComplete="current-password"
              error={errors.password}
              onFieldChange={clearError}
            />
            <Button type="submit" size="lg" disabled={mutation.isPending}>
              {mutation.isPending && <Spinner />}
              Entrar
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Ainda não tem conta?{" "}
              <Link
                to="/cadastro"
                search={redirectTo ? { redirect: redirectTo } : {}}
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                Cadastre-se
              </Link>
            </p>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
};
