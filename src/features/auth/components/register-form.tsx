import { Link } from "@tanstack/react-router";
import type { FormEvent } from "react";
import { validateRegister } from "../schemas";
import { useRegister } from "../use-auth-actions";
import { FormField } from "@/components/form-field";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { useFieldErrors } from "@/hooks/use-field-errors";
import { getFieldErrors, getFormErrorMessage, hasFieldErrors } from "@/utils/form-errors";
import { lettersMask } from "@/utils/input-masks";

export const RegisterForm = ({ redirectTo }: { redirectTo?: string }) => {
  const mutation = useRegister(redirectTo);
  const { errors, setErrors, clearError } = useFieldErrors();

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const { values, errors: found } = validateRegister(
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
        <CardTitle className="text-xl">Criar conta</CardTitle>
        <CardDescription>Cadastre-se para comprar e acompanhar seus pedidos.</CardDescription>
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
              label="Nome completo"
              name="name"
              autoComplete="name"
              maxLength={120}
              mask={lettersMask}
              error={errors.name}
              onFieldChange={clearError}
            />
            <FormField
              label="E-mail"
              name="email"
              type="email"
              autoComplete="email"
              maxLength={200}
              error={errors.email}
              onFieldChange={clearError}
            />
            <FormField
              label="Senha"
              name="password"
              type="password"
              autoComplete="new-password"
              description="Mínimo de 6 caracteres."
              error={errors.password}
              onFieldChange={clearError}
            />
            <FormField
              label="Confirmar senha"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              error={errors.confirmPassword}
              onFieldChange={clearError}
            />
            <Button type="submit" size="lg" disabled={mutation.isPending}>
              {mutation.isPending && <Spinner />}
              Criar conta
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Já tem conta?{" "}
              <Link
                to="/login"
                search={redirectTo ? { redirect: redirectTo } : {}}
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                Entrar
              </Link>
            </p>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
};
