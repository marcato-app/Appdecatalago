import Link from "next/link";
import { CopyLinkButton } from "./CopyLinkButton";

export type StoreHomeStats = {
  products: number;
  activeProducts: number;
  variants: number;
  variantsWithoutPhoto: number;
};

export type StoreHomeProps = {
  store: {
    name: string;
    slug: string;
    status: string;
    whatsappNumber: string | null;
    logoUrl: string | null;
    businessType: string;
  };
  templateName: string | null;
  isIphoneStore: boolean;
  stats: StoreHomeStats | null;
};

function Stat({ value, label }: { value: number | string; label: string }) {
  return (
    <div className="flex flex-1 flex-col rounded-2xl border border-zinc-200 bg-white px-4 py-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <span className="text-xl font-bold tabular-nums">{value}</span>
      <span className="text-xs text-zinc-500 dark:text-zinc-400">{label}</span>
    </div>
  );
}

function Step({
  done,
  title,
  description,
  href,
  cta,
}: {
  done: boolean;
  title: string;
  description: string;
  href: string;
  cta: string;
}) {
  return (
    <div className="flex items-start gap-3 px-4 py-3">
      <span
        aria-hidden="true"
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
          done ? "bg-emerald-500 text-white" : "border-2 border-zinc-300 text-transparent dark:border-zinc-700"
        }`}
      >
        ✓
      </span>
      <div className="min-w-0 flex-1">
        <p className={`text-sm font-medium ${done ? "text-zinc-400 line-through dark:text-zinc-600" : ""}`}>{title}</p>
        {!done ? <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">{description}</p> : null}
      </div>
      {!done ? (
        <Link
          href={href}
          className="shrink-0 rounded-full border border-zinc-300 px-3 py-1 text-xs font-semibold transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
        >
          {cta}
        </Link>
      ) : null}
    </div>
  );
}

export function StoreHome({ store, templateName, isIphoneStore, stats }: StoreHomeProps) {
  const isCatalog = store.businessType === "catalog";
  const isPublished = store.status === "published";
  const manageHref = isCatalog ? "/dashboard/loja/produtos" : "/dashboard/loja/conteudo";
  const steps = [
    {
      done: Boolean(store.whatsappNumber),
      title: "Ligar o WhatsApp",
      description: "É por onde o cliente fecha o pedido. Sem ele o botão da vitrine não aparece.",
      href: "/dashboard/loja",
      cta: "Configurar",
    },
    {
      done: (stats?.products ?? 0) > 0 || !isCatalog,
      title: isIphoneStore ? "Cadastrar os aparelhos" : "Cadastrar os produtos",
      description: isIphoneStore
        ? "Use o catálogo pronto: escolha os modelos, ponha o preço e a loja nasce montada."
        : "Crie as seções e os itens do seu cardápio.",
      href: isIphoneStore ? "/dashboard/loja/produtos/catalogo" : manageHref,
      cta: isIphoneStore ? "Abrir catálogo" : "Cadastrar",
    },
    {
      done: (stats?.variants ?? 0) === 0 || (stats?.variantsWithoutPhoto ?? 0) === 0,
      title: "Adicionar as fotos",
      description: `${stats?.variantsWithoutPhoto ?? 0} variações ainda estão sem foto — é a foto que faz o cliente parar pra olhar.`,
      href: isIphoneStore ? "/dashboard/loja/produtos/fotos" : manageHref,
      cta: isIphoneStore ? "Fotos em massa" : "Adicionar",
    },
    {
      done: Boolean(store.logoUrl),
      title: "Subir a logo",
      description: "Aparece no topo da vitrine e no compartilhamento do link.",
      href: "/dashboard/loja",
      cta: "Subir",
    },
    {
      done: isPublished,
      title: "Publicar a loja",
      description: "Enquanto está em rascunho, só você consegue abrir o link.",
      href: "/dashboard/loja",
      cta: "Publicar",
    },
  ];

  const remaining = steps.filter((step) => !step.done).length;

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 px-6 py-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{store.name}</h1>
        <p className="mt-1 flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
          <span
            className={`h-2 w-2 rounded-full ${isPublished ? "bg-emerald-500" : "bg-amber-500"}`}
            aria-hidden="true"
          />
          {isPublished ? "Publicada" : "Rascunho — só você vê"}
          {templateName ? ` · ${templateName}` : ""}
        </p>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {isPublished ? "Link da sua loja" : "Link (prévia só pra você)"}
          </p>
          <p className="truncate font-medium text-violet-600 dark:text-violet-400">/{store.slug}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <CopyLinkButton path={`/${store.slug}`} />
          <Link
            href={`/${store.slug}`}
            target="_blank"
            className="rounded-full border border-zinc-300 px-4 py-1.5 text-sm font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
          >
            Abrir ↗
          </Link>
        </div>
      </div>

      {stats ? (
        <div className="flex gap-2">
          <Stat value={stats.products} label={isIphoneStore ? "aparelhos" : "produtos"} />
          <Stat value={stats.variants} label="variações" />
          <Stat value={stats.activeProducts} label="na vitrine" />
        </div>
      ) : null}

      <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
          <h2 className="text-sm font-semibold">
            {remaining === 0 ? "Tudo pronto 🎉" : `Faltam ${remaining} ${remaining === 1 ? "passo" : "passos"}`}
          </h2>
          <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
            {remaining === 0 ? "Sua loja está no ar e completa." : "O caminho mais curto pra loja ficar boa de verdade."}
          </p>
        </div>
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {steps.map((step) => (
            <Step key={step.title} {...step} />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Link
          href={manageHref}
          className="rounded-2xl border border-zinc-200 bg-white px-4 py-4 text-sm font-medium shadow-sm transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800/60"
        >
          {isCatalog ? (isIphoneStore ? "Aparelhos" : "Produtos") : "Conteúdo"}
          <span className="mt-0.5 block text-xs font-normal text-zinc-500 dark:text-zinc-400">
            Cadastrar, editar e ordenar
          </span>
        </Link>
        {isIphoneStore ? (
          <Link
            href="/dashboard/loja/produtos/catalogo"
            className="rounded-2xl border border-zinc-200 bg-white px-4 py-4 text-sm font-medium shadow-sm transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800/60"
          >
            Catálogo
            <span className="mt-0.5 block text-xs font-normal text-zinc-500 dark:text-zinc-400">
              Modelos prontos pra importar
            </span>
          </Link>
        ) : null}
        <Link
          href="/dashboard/loja"
          className="rounded-2xl border border-zinc-200 bg-white px-4 py-4 text-sm font-medium shadow-sm transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800/60"
        >
          Sua loja
          <span className="mt-0.5 block text-xs font-normal text-zinc-500 dark:text-zinc-400">
            Dados, links, modelo e vitrine
          </span>
        </Link>
      </div>
    </div>
  );
}
