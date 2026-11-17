import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { formatCardNumber, formatExpiry } from "../card";
import { placeOrder } from "../checkout.functions";
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
import { Field, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { PAYMENT_METHODS, type PaymentMethod } from "@/db/enums";
import { cartActions, useCart } from "@/features/cart/cart-store";
import { PAYMENT_METHOD_LABELS } from "@/features/orders/constants";
import { formatCurrency } from "@/utils/format";

const field = (form: FormData, name: string) => String(form.get(name) ?? "");

export function CheckoutPage() {
  const { items, totalCents } = useCart();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("pix");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");

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

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    mutation.mutate({
      items: items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
      paymentMethod,
      notes: field(form, "notes"),
      address: {
        street: field(form, "street"),
        number: field(form, "number"),
        complement: field(form, "complement"),
        district: field(form, "district"),
        city: field(form, "city"),
        state: field(form, "state"),
        zip: field(form, "zip"),
      },
      card:
        paymentMethod === "cartao"
          ? {
              number: cardNumber,
              holder: field(form, "cardHolder"),
              expiry,
              cvv: field(form, "cvv"),
            }
          : undefined,
    });
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
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
                <Field className="sm:col-span-2">
                  <FieldLabel htmlFor="zip">CEP</FieldLabel>
                  <Input id="zip" name="zip" required inputMode="numeric" placeholder="00000-000" />
                </Field>
                <Field className="sm:col-span-4">
                  <FieldLabel htmlFor="street">Endereço</FieldLabel>
                  <Input id="street" name="street" required autoComplete="address-line1" />
                </Field>
                <Field className="sm:col-span-2">
                  <FieldLabel htmlFor="number">Número</FieldLabel>
                  <Input id="number" name="number" required />
                </Field>
                <Field className="sm:col-span-4">
                  <FieldLabel htmlFor="complement">Complemento</FieldLabel>
                  <Input id="complement" name="complement" placeholder="Apto, bloco…" />
                </Field>
                <Field className="sm:col-span-2">
                  <FieldLabel htmlFor="district">Bairro</FieldLabel>
                  <Input id="district" name="district" required />
                </Field>
                <Field className="sm:col-span-3">
                  <FieldLabel htmlFor="city">Cidade</FieldLabel>
                  <Input id="city" name="city" required autoComplete="address-level2" />
                </Field>
                <Field className="sm:col-span-1">
                  <FieldLabel htmlFor="state">UF</FieldLabel>
                  <Input id="state" name="state" required maxLength={2} placeholder="SP" />
                </Field>
                <Field className="sm:col-span-6">
                  <FieldLabel htmlFor="notes">Observações</FieldLabel>
                  <Textarea
                    id="notes"
                    name="notes"
                    maxLength={300}
                    placeholder="Ex.: interfone quebrado, presente para aniversário…"
                  />
                </Field>
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
                  onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
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
                  <Field className="sm:col-span-4">
                    <FieldLabel htmlFor="cardNumber">Número do cartão</FieldLabel>
                    <Input
                      id="cardNumber"
                      inputMode="numeric"
                      autoComplete="cc-number"
                      required
                      value={cardNumber}
                      onChange={(event) => setCardNumber(formatCardNumber(event.target.value))}
                      placeholder="4111 1111 1111 1111"
                    />
                  </Field>
                  <Field className="sm:col-span-4">
                    <FieldLabel htmlFor="cardHolder">Nome impresso no cartão</FieldLabel>
                    <Input id="cardHolder" name="cardHolder" autoComplete="cc-name" required />
                  </Field>
                  <Field className="sm:col-span-2">
                    <FieldLabel htmlFor="expiry">Validade</FieldLabel>
                    <Input
                      id="expiry"
                      inputMode="numeric"
                      autoComplete="cc-exp"
                      required
                      value={expiry}
                      onChange={(event) => setExpiry(formatExpiry(event.target.value))}
                      placeholder="MM/AA"
                    />
                  </Field>
                  <Field className="sm:col-span-2">
                    <FieldLabel htmlFor="cvv">CVV</FieldLabel>
                    <Input
                      id="cvv"
                      name="cvv"
                      inputMode="numeric"
                      autoComplete="cc-csc"
                      required
                      maxLength={4}
                    />
                  </Field>
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
            {mutation.error && (
              <Alert variant="destructive">
                <AlertDescription>{mutation.error.message}</AlertDescription>
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
}
