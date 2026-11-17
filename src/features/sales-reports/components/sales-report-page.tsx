import { Download01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { salesReportQueryOptions } from "../queries";
import type { SalesReport } from "../types";
import { ReportRangeForm } from "./report-range-form";
import { RevenueChart } from "./revenue-chart";
import { StatCard } from "@/components/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PAYMENT_METHOD_LABELS } from "@/features/orders/constants";
import { addDays, todayKey } from "@/utils/dates";
import { formatCurrency } from "@/utils/format";

const PRESETS = [
  { label: "7 dias", days: 7 },
  { label: "30 dias", days: 30 },
  { label: "90 dias", days: 90 },
];

const formatDayKey = (key: string) => key.split("-").reverse().join("/");

const toCsv = (report: SalesReport) => {
  const money = (cents: number) => (cents / 100).toFixed(2).replace(".", ",");
  const lines = [
    `Relatório de vendas;${formatDayKey(report.from)} a ${formatDayKey(report.to)}`,
    "",
    "Data;Pedidos;Receita (R$)",
    ...report.byDay.map(
      (row) => `${formatDayKey(row.day)};${row.orders};${money(row.revenueCents)}`,
    ),
    "",
    "Produto;Categoria;Quantidade;Receita (R$)",
    ...report.byProduct.map(
      (row) =>
        `"${row.name.replaceAll('"', '""')}";${row.category};${row.quantity};${money(row.revenueCents)}`,
    ),
  ];
  return lines.join("\n");
};

const downloadCsv = (report: SalesReport) => {
  const blob = new Blob([`﻿${toCsv(report)}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `vendas_${report.from}_${report.to}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};

export function SalesReportPage({ from, to }: { from: string; to: string }) {
  const navigate = useNavigate({ from: "/admin/relatorios" });
  const { data: report } = useSuspenseQuery(salesReportQueryOptions({ from, to }));
  const { summary } = report;
  const setRange = (range: { from: string; to: string }) => navigate({ search: range });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">Relatórios de vendas</h1>
          <p className="text-muted-foreground">
            {formatDayKey(report.from)} a {formatDayKey(report.to)} · pedidos cancelados não entram
            na receita.
          </p>
        </div>
        <Button type="button" variant="outline" onClick={() => downloadCsv(report)}>
          <HugeiconsIcon icon={Download01Icon} strokeWidth={2} data-icon="inline-start" />
          Exportar CSV
        </Button>
      </div>

      <Card size="sm">
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
          <ReportRangeForm range={{ from, to }} onApply={setRange} />
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((preset) => {
              const today = todayKey();
              const range = { from: addDays(today, -(preset.days - 1)), to: today };
              const active = range.from === from && range.to === to;
              return (
                <Button
                  key={preset.days}
                  type="button"
                  size="sm"
                  variant={active ? "default" : "outline"}
                  onClick={() => setRange(range)}
                >
                  Últimos {preset.label}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Receita" value={formatCurrency(summary.revenueCents)} />
        <StatCard
          label="Pedidos"
          value={String(summary.orders)}
          hint={`${summary.cancelledOrders} cancelados`}
        />
        <StatCard label="Ticket médio" value={formatCurrency(summary.averageTicketCents)} />
        <StatCard
          label="Cupcakes vendidos"
          value={String(summary.itemsSold)}
          hint={`${summary.customers} clientes compraram`}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Receita por dia</CardTitle>
          <CardDescription>Passe o cursor sobre as barras para ver os valores</CardDescription>
        </CardHeader>
        <CardContent>
          <RevenueChart data={report.byDay} className="aspect-auto h-72 w-full" />
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Vendas por produto</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead className="text-right">Qtd.</TableHead>
                  <TableHead className="text-right">Receita</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {report.byProduct.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                      Nenhuma venda no período.
                    </TableCell>
                  </TableRow>
                )}
                {report.byProduct.map((row) => (
                  <TableRow key={`${row.productId}-${row.name}`}>
                    <TableCell className="font-medium">{row.name}</TableCell>
                    <TableCell>{row.category}</TableCell>
                    <TableCell className="text-right tabular-nums">{row.quantity}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatCurrency(row.revenueCents)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Por categoria</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableBody>
                  {report.byCategory.map((row) => (
                    <TableRow key={row.category}>
                      <TableCell>{row.category}</TableCell>
                      <TableCell className="text-right tabular-nums">{row.quantity} un.</TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatCurrency(row.revenueCents)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Por forma de pagamento</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableBody>
                  {report.byPaymentMethod.map((row) => (
                    <TableRow key={row.method}>
                      <TableCell>{PAYMENT_METHOD_LABELS[row.method]}</TableCell>
                      <TableCell className="text-right tabular-nums">{row.orders} ped.</TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatCurrency(row.revenueCents)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
