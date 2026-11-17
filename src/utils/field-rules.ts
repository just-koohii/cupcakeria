export const asText = (value: unknown) => (typeof value === "string" ? value.trim() : "");

export const required = (value: string, message: string) => (value ? undefined : message);

export const minLength = (value: string, min: number, label: string) =>
  value && value.length < min ? `${label} deve ter ao menos ${min} caracteres.` : undefined;

export const maxLength = (value: string, max: number, label: string) =>
  value.length > max ? `${label} deve ter no máximo ${max} caracteres.` : undefined;

export const email = (value: string) =>
  value && !/^[^\s@]+@[^\s@]+$/.test(value) ? "Informe um e-mail válido." : undefined;

export const lettersOnly = (value: string, label: string) =>
  value && !/^[\p{L}\s'.-]+$/u.test(value) ? `${label} deve conter apenas letras.` : undefined;

export const digitsOnly = (value: string, label: string) =>
  value && !/^\d+$/.test(value) ? `${label} deve conter apenas números.` : undefined;
