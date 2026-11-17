export type InputMask = (value: string) => string;

export const digitsMask =
  (maxLength?: number): InputMask =>
  (value) =>
    value.replace(/\D/g, "").slice(0, maxLength);

export const lettersMask: InputMask = (value) =>
  value.replace(/[^\p{L}\s'.-]/gu, "").replace(/\s{2,}/g, " ");

export const stateMask: InputMask = (value) =>
  value
    .replace(/[^\p{L}]/gu, "")
    .toUpperCase()
    .slice(0, 2);

export const zipMask: InputMask = (value) => {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  return digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
};

export const cardNumberMask: InputMask = (value) =>
  value
    .replace(/\D/g, "")
    .slice(0, 19)
    .replace(/(\d{4})(?=\d)/g, "$1 ");

export const expiryMask: InputMask = (value) => {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
};

export const currencyMask: InputMask = (value) => {
  const [integer = "", ...rest] = value.replace(/[^\d,]/g, "").split(",");
  const trimmedInteger = integer.slice(0, 4);
  return rest.length > 0 ? `${trimmedInteger},${rest.join("").slice(0, 2)}` : trimmedInteger;
};
