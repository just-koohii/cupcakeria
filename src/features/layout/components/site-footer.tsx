import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} Cupcakeria</p>
        <p className="flex flex-wrap gap-x-4 gap-y-1">
          <span>Os dados voltam ao estado inicial a cada 2 horas.</span>
          <Link to="/creditos" className="underline-offset-4 hover:text-foreground hover:underline">
            Créditos das fotos
          </Link>
        </p>
      </div>
    </footer>
  );
}
