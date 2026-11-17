import { useCallback, useState } from "react";
import type { FieldErrors } from "@/utils/form-errors";

export const useFieldErrors = () => {
  const [errors, setErrors] = useState<FieldErrors>({});

  const clearError = useCallback(
    (field: string) =>
      setErrors((current) => {
        if (!(field in current)) {
          return current;
        }
        const { [field]: _removed, ...rest } = current;
        return rest;
      }),
    [],
  );

  return { errors, setErrors, clearError };
};
