import { isValidCardNumber, isValidExpiry } from "./card";
import { PAYMENT_METHODS, type PaymentMethod } from "@/db/enums";
import { asText, lettersOnly, maxLength, minLength, required } from "@/utils/field-rules";
import { createErrorCollector } from "@/utils/form-errors";
import { asRecord } from "@/utils/validation";

const STATES = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
];

export interface CheckoutFormValues {
  zip: string;
  street: string;
  number: string;
  complement: string;
  district: string;
  city: string;
  state: string;
  notes: string;
  paymentMethod: PaymentMethod;
  cardNumber: string;
  cardHolder: string;
  cardExpiry: string;
  cardCvv: string;
}

export const validateCheckoutForm = (input: unknown) => {
  const data = asRecord(input);
  const paymentMethod = PAYMENT_METHODS.includes(data.paymentMethod as PaymentMethod)
    ? (data.paymentMethod as PaymentMethod)
    : "pix";
  const values: CheckoutFormValues = {
    zip: asText(data.zip),
    street: asText(data.street),
    number: asText(data.number),
    complement: asText(data.complement),
    district: asText(data.district),
    city: asText(data.city),
    state: asText(data.state).toUpperCase(),
    notes: asText(data.notes),
    paymentMethod,
    cardNumber: asText(data.cardNumber).replace(/\s/g, ""),
    cardHolder: asText(data.cardHolder),
    cardExpiry: asText(data.cardExpiry),
    cardCvv: asText(data.cardCvv),
  };

  const { errors, add } = createErrorCollector();
  add("zip", required(values.zip, "Informe o CEP."));
  if (values.zip && !/^\d{5}-?\d{3}$/.test(values.zip)) {
    add("zip", "CEP inválido. Use o formato 00000-000.");
  }
  add("street", required(values.street, "Informe o endereço."));
  add("street", maxLength(values.street, 120, "O endereço"));
  add("number", required(values.number, "Informe o número."));
  if (values.number && !/^\d{1,6}$/.test(values.number)) {
    add("number", "O número deve conter apenas dígitos.");
  }
  add("complement", maxLength(values.complement, 60, "O complemento"));
  add("district", required(values.district, "Informe o bairro."));
  add("district", maxLength(values.district, 60, "O bairro"));
  add("city", required(values.city, "Informe a cidade."));
  add("city", lettersOnly(values.city, "A cidade"));
  add("city", maxLength(values.city, 60, "A cidade"));
  add("state", required(values.state, "Informe a UF."));
  if (values.state && !STATES.includes(values.state)) {
    add("state", "UF inválida.");
  }
  add("notes", maxLength(values.notes, 300, "As observações"));
  if (!PAYMENT_METHODS.includes(data.paymentMethod as PaymentMethod)) {
    add("paymentMethod", "Escolha a forma de pagamento.");
  }

  if (paymentMethod === "cartao") {
    add("cardNumber", required(values.cardNumber, "Informe o número do cartão."));
    if (values.cardNumber && !isValidCardNumber(values.cardNumber)) {
      add("cardNumber", "Número do cartão inválido.");
    }
    add("cardHolder", required(values.cardHolder, "Informe o nome impresso no cartão."));
    add("cardHolder", lettersOnly(values.cardHolder, "O nome do titular"));
    add("cardHolder", minLength(values.cardHolder, 3, "O nome do titular"));
    add("cardExpiry", required(values.cardExpiry, "Informe a validade."));
    if (values.cardExpiry && !isValidExpiry(values.cardExpiry)) {
      add("cardExpiry", "Validade inválida ou expirada.");
    }
    add("cardCvv", required(values.cardCvv, "Informe o CVV."));
    if (values.cardCvv && !/^\d{3,4}$/.test(values.cardCvv)) {
      add("cardCvv", "O CVV deve ter 3 ou 4 dígitos.");
    }
  }

  return { values, errors };
};
