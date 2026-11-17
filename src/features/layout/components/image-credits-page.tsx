import credits from "@/db/seed/image-credits.json";

export function ImageCreditsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-3xl font-bold tracking-tight">Créditos das fotos</h1>
        <p className="max-w-prose text-muted-foreground">
          Todas as fotos do catálogo são fotografias reais publicadas no Wikimedia Commons sob
          licenças livres. Agradecemos aos autores abaixo.
        </p>
      </div>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {credits.map((credit) => (
          <li key={credit.file} className="flex gap-3 rounded-xl border bg-card p-3 text-sm">
            <img
              src={credit.file}
              alt=""
              loading="lazy"
              className="size-16 shrink-0 rounded-md object-cover"
            />
            <div className="flex min-w-0 flex-col">
              <a
                href={credit.source}
                target="_blank"
                rel="noopener noreferrer"
                className="truncate font-medium text-foreground hover:text-primary"
              >
                {credit.title}
              </a>
              <span className="truncate text-muted-foreground">
                {credit.author || "Autor desconhecido"}
              </span>
              <span className="text-muted-foreground">{credit.license}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
