import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { shortDayLabel } from "@/utils/dates";
import { formatCurrency } from "@/utils/format";

const chartConfig = {
  revenue: { label: "Receita", color: "var(--primary)" },
} satisfies ChartConfig;

interface RevenueChartProps {
  data: Array<{ day: string; orders: number; revenueCents: number }>;
  className?: string;
}

export function RevenueChart({ data, className }: RevenueChartProps) {
  const rows = data.map((row) => ({
    day: shortDayLabel(row.day),
    revenue: row.revenueCents / 100,
    orders: row.orders,
  }));

  return (
    <ChartContainer config={chartConfig} className={className ?? "aspect-auto h-64 w-full"}>
      <BarChart data={rows} margin={{ left: 4, right: 4, top: 8 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} minTickGap={16} />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={56}
          tickFormatter={(value: number) => `R$ ${value.toFixed(0)}`}
        />
        <ChartTooltip
          cursor={{ fill: "var(--muted)", opacity: 0.6 }}
          content={
            <ChartTooltipContent
              formatter={(value, _name, item) => (
                <div className="flex w-full justify-between gap-4">
                  <span className="text-muted-foreground">
                    {item.payload.orders} {item.payload.orders === 1 ? "pedido" : "pedidos"}
                  </span>
                  <span className="font-medium tabular-nums">
                    {formatCurrency(Math.round(Number(value) * 100))}
                  </span>
                </div>
              )}
            />
          }
        />
        <Bar dataKey="revenue" fill="var(--color-revenue)" radius={[4, 4, 0, 0]} maxBarSize={36} />
      </BarChart>
    </ChartContainer>
  );
}
