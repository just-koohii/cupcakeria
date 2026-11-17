import { createServerFn } from "@tanstack/react-start";
import { buildSalesReport } from "./sales.server";
import { adminMiddleware } from "@/features/auth/middleware";
import { addDays, isDayKey, todayKey } from "@/utils/dates";
import { asRecord } from "@/utils/validation";

const MAX_RANGE_DAYS = 366;

export const getSalesReport = createServerFn({ method: "GET" })
  .middleware([adminMiddleware])
  .validator((input: unknown) => {
    const data = asRecord(input);
    const to = isDayKey(data.to) ? data.to : todayKey();
    const from = isDayKey(data.from) ? data.from : addDays(to, -29);
    if (from > to) {
      throw new Error("A data inicial deve ser anterior à data final.");
    }
    if (addDays(from, MAX_RANGE_DAYS) < to) {
      throw new Error("O período máximo do relatório é de 1 ano.");
    }
    return { from, to };
  })
  .handler(async ({ data }) => buildSalesReport(data.from, data.to));
