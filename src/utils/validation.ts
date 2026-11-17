export class ValidationError extends Error {}

const fail = (message: string): never => {
  throw new ValidationError(message);
};

export const asRecord = (input: unknown): Record<string, unknown> => {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    return fail("Dados inválidos.");
  }
  return input as Record<string, unknown>;
};

export const requiredString = (
  value: unknown,
  label: string,
  { min = 1, max = 500 }: { min?: number; max?: number } = {},
): string => {
  if (typeof value !== "string") {
    return fail(`${label} é obrigatório.`);
  }
  const trimmed = value.trim();
  if (trimmed.length < min) {
    return fail(
      min <= 1 ? `${label} é obrigatório.` : `${label} deve ter ao menos ${min} caracteres.`,
    );
  }
  if (trimmed.length > max) {
    return fail(`${label} deve ter no máximo ${max} caracteres.`);
  }
  return trimmed;
};

export const optionalString = (value: unknown, label: string, max = 500): string | null => {
  if (value === undefined || value === null || value === "") {
    return null;
  }
  return requiredString(value, label, { max });
};

export const integerInRange = (value: unknown, label: string, min: number, max: number): number => {
  const parsed = typeof value === "string" ? Number(value) : value;
  if (typeof parsed !== "number" || !Number.isInteger(parsed) || parsed < min || parsed > max) {
    return fail(`${label} deve ser um número inteiro entre ${min} e ${max}.`);
  }
  return parsed;
};

export const oneOf = <T extends string>(
  value: unknown,
  options: readonly T[],
  label: string,
): T => {
  if (typeof value !== "string" || !options.includes(value as T)) {
    return fail(`${label} inválido.`);
  }
  return value as T;
};

export const isEmailLike = (value: string) => /^[^\s@]+@[^\s@]+$/.test(value);
