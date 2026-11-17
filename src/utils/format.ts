const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const dateTime = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
  timeZone: "America/Sao_Paulo",
});
const dateOnly = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeZone: "America/Sao_Paulo",
});
const timeOnly = new Intl.DateTimeFormat("pt-BR", {
  timeStyle: "short",
  timeZone: "America/Sao_Paulo",
});

export const formatCurrency = (cents: number) => currency.format(cents / 100);
export const formatDateTime = (value: Date | number) => dateTime.format(value);
export const formatDate = (value: Date | number) => dateOnly.format(value);
export const formatTime = (value: Date | number) => timeOnly.format(value);

export const parseCurrencyToCents = (value: string) => {
  const normalized = value.replace(/[^\d,.-]/g, "").replace(",", ".");
  const parsed = Number.parseFloat(normalized);
  return Number.isNaN(parsed) ? Number.NaN : Math.round(parsed * 100);
};

export const centsToInput = (cents: number) => (cents / 100).toFixed(2).replace(".", ",");
