import type { ChangeEvent, ComponentProps, ReactNode } from "react";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { InputMask } from "@/utils/input-masks";

interface BaseFieldProps {
  label: string;
  name: string;
  error?: string;
  description?: ReactNode;
  fieldClassName?: string;
  mask?: InputMask;
  onFieldChange?: (name: string) => void;
}

const applyMask = (
  event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  mask: InputMask | undefined,
) => {
  if (!mask) {
    return;
  }
  const masked = mask(event.target.value);
  if (masked !== event.target.value) {
    event.target.value = masked;
  }
};

const FieldShell = ({
  id,
  label,
  error,
  description,
  fieldClassName,
  children,
}: Pick<BaseFieldProps, "label" | "error" | "description" | "fieldClassName"> & {
  id: string;
  children: ReactNode;
}) => (
  <Field data-invalid={error !== undefined || undefined} className={fieldClassName}>
    <FieldLabel htmlFor={id}>{label}</FieldLabel>
    {children}
    {description && !error && <FieldDescription>{description}</FieldDescription>}
    {error && <FieldError id={`${id}-error`}>{error}</FieldError>}
  </Field>
);

type FormFieldProps = BaseFieldProps & Omit<ComponentProps<typeof Input>, "name">;

export const FormField = ({
  label,
  name,
  id = name,
  error,
  description,
  fieldClassName,
  mask,
  onFieldChange,
  onChange,
  ...props
}: FormFieldProps) => (
  <FieldShell
    id={id}
    label={label}
    error={error}
    description={description}
    fieldClassName={fieldClassName}
  >
    <Input
      id={id}
      name={name}
      aria-invalid={error !== undefined || undefined}
      aria-describedby={error ? `${id}-error` : undefined}
      onChange={(event) => {
        applyMask(event, mask);
        onFieldChange?.(name);
        onChange?.(event);
      }}
      {...props}
    />
  </FieldShell>
);

type FormTextareaFieldProps = BaseFieldProps & Omit<ComponentProps<typeof Textarea>, "name">;

export const FormTextareaField = ({
  label,
  name,
  id = name,
  error,
  description,
  fieldClassName,
  mask,
  onFieldChange,
  onChange,
  ...props
}: FormTextareaFieldProps) => (
  <FieldShell
    id={id}
    label={label}
    error={error}
    description={description}
    fieldClassName={fieldClassName}
  >
    <Textarea
      id={id}
      name={name}
      aria-invalid={error !== undefined || undefined}
      aria-describedby={error ? `${id}-error` : undefined}
      onChange={(event) => {
        applyMask(event, mask);
        onFieldChange?.(name);
        onChange?.(event);
      }}
      {...props}
    />
  </FieldShell>
);
