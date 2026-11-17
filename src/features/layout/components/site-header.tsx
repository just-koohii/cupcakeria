import {
  CakeIcon,
  Logout01Icon,
  Menu01Icon,
  ShoppingCart01Icon,
  UserCircleIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useCurrentUser } from "@/features/auth/queries";
import type { SessionUser } from "@/features/auth/types";
import { useLogout } from "@/features/auth/use-auth-actions";
import { useCart } from "@/features/cart/cart-store";

interface NavItem {
  to: string;
  label: string;
  exact?: boolean;
}

const navFor = (user: SessionUser | null): NavItem[] => {
  const shared: NavItem[] = [
    { to: "/", label: "Início", exact: true },
    { to: "/produtos", label: "Cupcakes" },
  ];
  if (user?.role === "admin") {
    return [
      ...shared,
      { to: "/admin", label: "Dashboard", exact: true },
      { to: "/admin/produtos", label: "Produtos" },
      { to: "/admin/pedidos", label: "Pedidos" },
      { to: "/admin/relatorios", label: "Relatórios" },
    ];
  }
  if (user?.role === "customer") {
    return [...shared, { to: "/meus-pedidos", label: "Meus pedidos" }];
  }
  return shared;
};

const linkClass =
  "rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground data-[status=active]:text-foreground data-[status=active]:bg-muted";

function CartButton() {
  const { count } = useCart();
  return (
    <Link
      to="/carrinho"
      aria-label={`Carrinho com ${count} itens`}
      className={buttonVariants({ variant: "ghost", size: "icon", className: "relative" })}
    >
      <HugeiconsIcon icon={ShoppingCart01Icon} strokeWidth={2} />
      {count > 0 && (
        <Badge className="absolute -top-1 -right-1 h-4 min-w-4 px-1 text-[10px] tabular-nums">
          {count}
        </Badge>
      )}
    </Link>
  );
}

function UserMenu({ user }: { user: SessionUser }) {
  const logout = useLogout();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button type="button" variant="ghost" size="icon" aria-label="Menu da conta" />}
      >
        <HugeiconsIcon icon={UserCircleIcon} strokeWidth={2} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel>
            <div className="flex flex-col">
              <span className="font-medium text-foreground">{user.name}</span>
              <span className="truncate text-xs font-normal">{user.email}</span>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={() => logout.mutate()}>
          <HugeiconsIcon icon={Logout01Icon} strokeWidth={2} />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function SiteHeader() {
  const user = useCurrentUser();
  const logout = useLogout();
  const [mobileOpen, setMobileOpen] = useState(false);
  const items = navFor(user);

  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur supports-backdrop-filter:bg-background/70">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-2 px-4">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger
            render={
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="md:hidden"
                aria-label="Abrir menu"
              />
            }
          >
            <HugeiconsIcon icon={Menu01Icon} strokeWidth={2} />
          </SheetTrigger>
          <SheetContent side="left" className="w-72">
            <SheetHeader>
              <SheetTitle>Cupcakeria</SheetTitle>
              <SheetDescription>{user ? `Olá, ${user.name}` : "Bem-vindo(a)!"}</SheetDescription>
            </SheetHeader>
            <nav className="flex flex-col gap-1 px-4" aria-label="Navegação principal">
              {items.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  activeOptions={{ exact: item.exact }}
                  className={linkClass}
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              {user ? (
                <Button
                  type="button"
                  variant="ghost"
                  className="justify-start"
                  onClick={() => {
                    setMobileOpen(false);
                    logout.mutate();
                  }}
                >
                  Sair
                </Button>
              ) : (
                <>
                  <Link to="/login" className={linkClass} onClick={() => setMobileOpen(false)}>
                    Entrar
                  </Link>
                  <Link to="/cadastro" className={linkClass} onClick={() => setMobileOpen(false)}>
                    Criar conta
                  </Link>
                </>
              )}
            </nav>
          </SheetContent>
        </Sheet>

        <Link to="/" className="flex items-center gap-2 text-foreground no-underline">
          <span className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <HugeiconsIcon icon={CakeIcon} strokeWidth={2} className="size-4" />
          </span>
          <span className="display-title text-lg font-bold">Cupcakeria</span>
        </Link>

        <nav className="ml-4 hidden items-center gap-1 md:flex" aria-label="Navegação principal">
          {items.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.exact }}
              className={linkClass}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1">
          {user?.role !== "admin" && user && <CartButton />}
          {user ? (
            <UserMenu user={user} />
          ) : (
            <>
              <Link to="/login" className={buttonVariants({ variant: "ghost", size: "sm" })}>
                Entrar
              </Link>
              <Link
                to="/cadastro"
                className={buttonVariants({ size: "sm", className: "hidden sm:inline-flex" })}
              >
                Criar conta
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
