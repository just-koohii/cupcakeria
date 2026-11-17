const TIME_ZONE = "America/Sao_Paulo";
const OFFSET = "-03:00";
const DAY_MS = 24 * 60 * 60 * 1000;

const keyFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export const isDayKey = (value: unknown): value is string =>
  typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);

export const toDayKey = (value: Date | number) => keyFormatter.format(value);

export const todayKey = () => toDayKey(Date.now());

export const startOfDay = (key: string) => new Date(`${key}T00:00:00${OFFSET}`);

export const endOfDay = (key: string) => new Date(`${key}T23:59:59.999${OFFSET}`);

export const addDays = (key: string, days: number) =>
  toDayKey(startOfDay(key).getTime() + days * DAY_MS + 12 * 60 * 60 * 1000);

export const enumerateDays = (from: string, to: string) => {
  const days: string[] = [];
  for (let key = from; key <= to && days.length < 400; key = addDays(key, 1)) {
    days.push(key);
  }
  return days;
};

export const shortDayLabel = (key: string) => `${key.slice(8, 10)}/${key.slice(5, 7)}`;
