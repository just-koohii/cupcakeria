import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { type FormEvent, useState } from "react";
import { placeOrder } from "../checkout.functions";
import { validateCheckoutForm } from "../schemas";
import { FormField, FormTextareaField } from "@/components/form-field";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FieldError, FieldGroup, FieldLegend, FieldSet } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { PAYMENT_METHODS, type PaymentMethod } from "@/db/enums";
import { cartActions, useCart } from "@/features/cart/cart-store";
import { PAYMENT_METHOD_LABELS } from "@/features/orders/constants";
import { useFieldErrors } from "@/hooks/use-field-errors";
import {
  type FieldErrors,
  getFieldErrors,
  getFormErrorMessage,
  hasFieldErrors,
} from "@/utils/form-errors";
import { formatCurrency } from "@/utils/format";
import {
  cardNumberMask,
  digitsMask,
  expiryMask,
  lettersMask,
  stateMask,
  zipMask,
} from "@/utils/input-masks";

const focusFirstError = (errors: FieldErrors) => {
  const [first] = Object.keys(errors);
  if (first) {
    document.getElementById(first)?.focus();
  }
};

export const CheckoutPage = () => {
  const { items, totalCents } = useCart();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("pix");
  const { errors, setErrors, clearError } = useFieldErrors();

  const mutation = useMutation({
    mutationFn: (data: unknown) => placeOrder({ data }),
    onSuccess: async (order) => {
      cartActions.clear();
      await queryClient.invalidateQueries({ queryKey: ["orders"] });
      await queryClient.invalidateQueries({ queryKey: ["admin"] });
      toast.add({
        title: `Pedido #${order.id} realizado!`,
        description:
          order.status === "pago"
            ? "Pagamento aprovado. Já vamos começar o preparo."
            : "Pague na entrega. Já vamos começar o preparo.",
        type: "success",
      });
      await navigate({ to: "/meus-pedidos" });
    },
    onError: (error) => {
      const fieldErrors = getFieldErrors(error);
      setErrors(fieldErrors);
      focusFirstError(fieldErrors);
    },
  });

  if (items.length === 0 && !mutation.isSuccess) {
    return (
      <Alert>
        <AlertTitle>Seu carrinho está vazio</AlertTitle>
        <AlertDescription>
          Adicione cupcakes ao carrinho antes de finalizar a compra.{" "}
          <Link to="/produtos" className="font-medium text-primary underline">
            Ver cardápio
          </Link>
        </AlertDescription>
      </Alert>
    );
  }

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formValues = { ...Object.fromEntries(new FormData(event.currentTarget)), paymentMethod };
    const { errors: found } = validateCheckoutForm(formValues);
    setErrors(found);
    if (hasFieldErrors(found)) {
      focusFirstError(found);
      return;
    }
    mutation.mutate({
      ...formValues,
      items: items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
    });
  };

  const formError = getFormErrorMessage(mutation.error);
  const fieldProps = (name: string) => ({ name, error: errors[name], onFieldChange: clearError });

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
      <h1 className="font-heading text-3xl font-bold tracking-tight">Finalizar compra</h1>
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Entrega</CardTitle>
              <CardDescription>Entregamos no mesmo dia para pedidos até 16h.</CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup className="grid gap-4 sm:grid-cols-6">
                <FormField
                  {...fieldProps("zip")}
                  label="CEP"
                  fieldClassName="sm:col-span-2"
                  inputMode="numeric"
                  autoComplete="postal-code"
                  placeholder="00000-000"
                  mask={zipMask}
                />
                <FormField
                  {...fieldProps("street")}
                  label="Endereço"
                  fieldClassName="sm:col-span-4"
                  autoComplete="address-line1"
                  maxLength={120}
                />
                <FormField
                  {...fieldProps("number")}
                  label="Número"
                  fieldClassName="sm:col-span-2"
                  inputMode="numeric"
                  mask={digitsMask(6)}
                />
                <FormField
                  {...fieldProps("complement")}
                  label="Complemento"
                  fieldClassName="sm:col-span-4"
                  placeholder="Apto, bloco…"
                  maxLength={60}
                />
                <FormField
                  {...fieldProps("district")}
                  label="Bairro"
                  fieldClassName="sm:col-span-2"
                  maxLength={60}
                />
                <FormField
                  {...fieldProps("city")}
                  label="Cidade"
                  fieldClassName="sm:col-span-3"
                  autoComplete="address-level2"
                  maxLength={60}
                  mask={lettersMask}
                />
                <FormField
                  {...fieldProps("state")}
                  label="UF"
                  fieldClassName="sm:col-span-1"
                  autoComplete="address-level1"
                  placeholder="SP"
                  mask={stateMask}
                />
                <FormTextareaField
                  {...fieldProps("notes")}
                  label="Observações"
                  fieldClassName="sm:col-span-6"
                  maxLength={300}
                  placeholder="Ex.: interfone quebrado, presente para aniversário…"
                />
              </FieldGroup>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pagamento</CardTitle>
              <CardDescription>
                Ambiente de demonstração: nenhuma cobrança real é feita.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <FieldSet>
                <FieldLegend className="sr-only">Forma de pagamento</FieldLegend>
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={(value) => {
                    setPaymentMethod(value as PaymentMethod);
                    clearError("paymentMethod");
                  }}
                  className="grid gap-2 sm:grid-cols-3"
                >
                  {PAYMENT_METHODS.map((method) => (
                    <Label
                      key={method}
                      htmlFor={`payment-${method}`}
                      className="flex cursor-pointer items-center gap-2 rounded-lg border p-3 has-data-checked:border-primary has-data-checked:bg-primary/5"
                    >
                      <RadioGroupItem id={`payment-${method}`} value={method} />
                      {PAYMENT_METHOD_LABELS[method]}
                    </Label>
                  ))}
                </RadioGroup>
                {errors.paymentMethod && <FieldError>{errors.paymentMethod}</FieldError>}
              </FieldSet>

              {paymentMethod === "pix" && (
                <p className="text-sm text-muted-foreground">
                  O pagamento via Pix é confirmado automaticamente ao finalizar o pedido.
                </p>
              )}
              {paymentMethod === "dinheiro" && (
                <p className="text-sm text-muted-foreground">
                  Pague ao receber. Se precisar de troco, informe nas observações.
                </p>
              )}
              {paymentMethod === "cartao" && (
                <FieldGroup className="grid gap-4 sm:grid-cols-4">
                  <FormField
                    {...fieldProps("cardNumber")}
                    label="Número do cartão"
                    fieldClassName="sm:col-span-4"
                    inputMode="numeric"
                    autoComplete="cc-number"
                    placeholder="4111 1111 1111 1111"
                    mask={cardNumberMask}
                  />
                  <FormField
                    {...fieldProps("cardHolder")}
                    label="Nome impresso no cartão"
                    fieldClassName="sm:col-span-4"
                    autoComplete="cc-name"
                    maxLength={80}
                    mask={lettersMask}
                  />
                  <FormField
                    {...fieldProps("cardExpiry")}
                    label="Validade"
                    fieldClassName="sm:col-span-2"
                    inputMode="numeric"
                    autoComplete="cc-exp"
                    placeholder="MM/AA"
                    mask={expiryMask}
                  />
                  <FormField
                    {...fieldProps("cardCvv")}
                    label="CVV"
                    fieldClassName="sm:col-span-2"
                    inputMode="numeric"
                    autoComplete="cc-csc"
                    mask={digitsMask(4)}
                  />
                </FieldGroup>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="h-fit lg:sticky lg:top-20">
          <CardHeader>
            <CardTitle>Seu pedido</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm">
            {items.map((item) => (
              <div key={item.productId} className="flex justify-between gap-3">
                <span className="min-w-0 truncate">
                  {item.quantity}× {item.name}
                </span>
                <span className="tabular-nums">
                  {formatCurrency(item.priceCents * item.quantity)}
                </span>
              </div>
            ))}
            <Separator />
            <div className="flex justify-between text-base font-semibold">
              <span>Total</span>
              <span>{formatCurrency(totalCents)}</span>
            </div>
            {formError && (
              <Alert variant="destructive">
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button type="submit" size="lg" className="w-full" disabled={mutation.isPending}>
              {mutation.isPending && <Spinner />}
              Confirmar pedido
            </Button>
            <Link
              to="/carrinho"
              className={buttonVariants({ variant: "ghost", className: "w-full" })}
            >
              Voltar ao carrinho
            </Link>
          </CardFooter>
        </Card>
      </div>
    </form>
  );
};
