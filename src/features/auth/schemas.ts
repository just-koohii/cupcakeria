import { asText, email, lettersOnly, maxLength, minLength, required } from "@/utils/field-rules";
import { createErrorCollector } from "@/utils/form-errors";
import { asRecord } from "@/utils/validation";

export interface LoginValues {
  email: string;
  password: string;
}

export interface RegisterValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export const validateLogin = (input: unknown) => {
  const data = asRecord(input);
  const values: LoginValues = {
    email: asText(data.email).toLowerCase(),
    password: typeof data.password === "string" ? data.password : "",
  };
  const { errors, add } = createErrorCollector();
  add("email", required(values.email, "Informe seu e-mail."));
  add("email", email(values.email));
  add("password", required(values.password, "Informe sua senha."));
  return { values, errors };
};

export const validateRegister = (input: unknown) => {
  const data = asRecord(input);
  const values: RegisterValues = {
    name: asText(data.name),
    email: asText(data.email).toLowerCase(),
    password: typeof data.password === "string" ? data.password : "",
    confirmPassword: typeof data.confirmPassword === "string" ? data.confirmPassword : "",
  };
  const { errors, add } = createErrorCollector();
  add("name", required(values.name, "Informe seu nome."));
  add("name", lettersOnly(values.name, "O nome"));
  add("name", minLength(values.name, 2, "O nome"));
  add("name", maxLength(values.name, 120, "O nome"));
  add("email", required(values.email, "Informe seu e-mail."));
  add("email", email(values.email));
  add("email", maxLength(values.email, 200, "O e-mail"));
  add("password", required(values.password, "Crie uma senha."));
  add("password", minLength(values.password, 6, "A senha"));
  add("password", maxLength(values.password, 200, "A senha"));
  add("confirmPassword", required(values.confirmPassword, "Confirme sua senha."));
  if (values.confirmPassword && values.confirmPassword !== values.password) {
    add("confirmPassword", "As senhas não conferem.");
  }
  return { values, errors };
};
