import type { FormEvent } from "react";
import { FormField } from "@/components/form-field";
import { Button } from "@/components/ui/button";
import { useFieldErrors } from "@/hooks/use-field-errors";
import { isDayKey, todayKey } from "@/utils/dates";
import { asText, required } from "@/utils/field-rules";
import { createErrorCollector, hasFieldErrors } from "@/utils/form-errors";

interface ReportRange {
  from: string;
  to: string;
}

const validateRange = (input: Record<string, unknown>) => {
  const values = { from: asText(input.from), to: asText(input.to) };
  const { errors, add } = createErrorCollector();
  add("from", required(values.from, "Informe a data inicial."));
  add("to", required(values.to, "Informe a data final."));
  if (values.from && !isDayKey(values.from)) {
    add("from", "Data inválida.");
  }
  if (values.to && !isDayKey(values.to)) {
    add("to", "Data inválida.");
  }
  if (values.to > todayKey()) {
    add("to", "A data final não pode estar no futuro.");
  }
  if (values.from && values.to && values.from > values.to) {
    add("from", "A data inicial deve ser anterior à final.");
  }
  return { values, errors };
};

export const ReportRangeForm = ({
  range,
  onApply,
}: {
  range: ReportRange;
  onApply: (range: ReportRange) => void;
}) => {
  const { errors, setErrors, clearError } = useFieldErrors();

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const { values, errors: found } = validateRange(
      Object.fromEntries(new FormData(event.currentTarget)),
    );
    setErrors(found);
    if (!hasFieldErrors(found)) {
      onApply(values);
    }
  };

  return (
    <form
      key={`${range.from}-${range.to}`}
      onSubmit={onSubmit}
      noValidate
      className="flex flex-wrap items-start gap-3"
    >
      <FormField
        id="report-from"
        name="from"
        label="De"
        type="date"
        fieldClassName="w-auto"
        defaultValue={range.from}
        error={errors.from}
        onFieldChange={clearError}
      />
      <FormField
        id="report-to"
        name="to"
        label="Até"
        type="date"
        fieldClassName="w-auto"
        defaultValue={range.to}
        max={todayKey()}
        error={errors.to}
        onFieldChange={clearError}
      />
      <Button type="submit" className="mt-[1.375rem]">
        Aplicar
      </Button>
    </form>
  );
};
