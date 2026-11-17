export type FieldErrors = Record<string, string>;

const PREFIX = "FIELD_ERRORS:";

export class FormValidationError extends Error {
  constructor(readonly fieldErrors: FieldErrors) {
    super(`${PREFIX}${JSON.stringify(fieldErrors)}`);
  }
}

export const hasFieldErrors = (errors: FieldErrors) => Object.keys(errors).length > 0;

export const assertNoFieldErrors = (errors: FieldErrors) => {
  if (hasFieldErrors(errors)) {
    throw new FormValidationError(errors);
  }
};

export const getFieldErrors = (error: unknown): FieldErrors => {
  if (!(error instanceof Error) || !error.message.startsWith(PREFIX)) {
    return {};
  }
  try {
    return JSON.parse(error.message.slice(PREFIX.length)) as FieldErrors;
  } catch {
    return {};
  }
};

export const getFormErrorMessage = (error: unknown) =>
  error instanceof Error && !error.message.startsWith(PREFIX) ? error.message : null;

export const createErrorCollector = () => {
  const errors: FieldErrors = {};
  const add = (field: string, message: string | undefined) => {
    if (message !== undefined && errors[field] === undefined) {
      errors[field] = message;
    }
  };
  return { errors, add };
};
