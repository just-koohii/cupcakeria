import { useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { dashboardQueryOptions } from "../queries";
import { StatCard } from "@/components/stat-card";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ORDER_STATUSES } from "@/db/enums";
import { OrderStatusBadge } from "@/features/orders/components/order-status-badge";
import { ORDER_STATUS_LABELS } from "@/features/orders/constants";
import { RevenueChart } from "@/features/sales-reports/components/revenue-chart";
import { formatCurrency, formatDateTime, formatTime } from "@/utils/format";

export function DashboardPage() {
  const { data } = useSuspenseQuery(dashboardQueryOptions());
  const { totals } = data;
  const totalOrders = Object.values(data.statusCounts).reduce((sum, value) => sum + value, 0);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Visão geral da loja. Os dados de demonstração voltam ao estado inicial às{" "}
          {formatTime(data.nextResetAt)}.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Receita total"
          value={formatCurrency(totals.revenueCents)}
          hint="Exclui cancelados"
        />
        <StatCard
          label="Pedidos"
          value={String(totals.orders)}
          hint={`${totals.openOrders} em aberto`}
        />
        <StatCard label="Ticket médio" value={formatCurrency(totals.averageTicketCents)} />
        <StatCard
          label="Cupcakes vendidos"
          value={String(totals.itemsSold)}
          hint={`${totals.customers} clientes · ${totals.activeProducts} produtos ativos`}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Receita nos últimos 14 dias</CardTitle>
            <CardDescription>Valor diário dos pedidos não cancelados</CardDescription>
            <CardAction>
              <Link
                to="/admin/relatorios"
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                Relatórios
              </Link>
            </CardAction>
          </CardHeader>
          <CardContent>
            <RevenueChart data={data.revenueByDay} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pedidos por status</CardTitle>
            <CardDescription>{totalOrders} pedidos no total</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {ORDER_STATUSES.map((status) => {
              const value = data.statusCounts[status];
              return (
                <div key={status} className="flex flex-col gap-1">
                  <div className="flex justify-between text-sm">
                    <span>{ORDER_STATUS_LABELS[status]}</span>
                    <span className="tabular-nums text-muted-foreground">{value}</span>
                  </div>
                  <Progress
                    value={totalOrders ? (value / totalOrders) * 100 : 0}
                    aria-label={`${ORDER_STATUS_LABELS[status]}: ${value} pedidos`}
                  />
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Mais vendidos</CardTitle>
            <CardDescription>Top 5 por receita</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead className="text-right">Qtd.</TableHead>
                  <TableHead className="text-right">Receita</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.topProducts.map((product) => (
                  <TableRow key={`${product.productId}-${product.name}`}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell className="text-right tabular-nums">{product.quantity}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatCurrency(product.revenueCents)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pedidos recentes</CardTitle>
            <CardAction>
              <Link
                to="/admin/pedidos"
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                Ver todos
              </Link>
            </CardAction>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pedido</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.recentOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">#{order.id}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatDateTime(order.createdAt)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{order.customerName}</TableCell>
                    <TableCell>
                      <OrderStatusBadge status={order.status} />
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatCurrency(order.totalCents)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
