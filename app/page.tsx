import Link from "next/link";
import { templateManifests } from "@/templates/registry";

const STEPS = [
  {
    number: "01",
    title: "Cadastre sua loja",
    body: "Nome, ramo de atividade, WhatsApp e redes sociais. Leva menos de 2 minutos.",
  },
  {
    number: "02",
    title: "Escolha um modelo",
    body: "Modelos prontos pra cardápio, vitrine de serviços ou portfólio — com cores e fontes do seu jeito.",
  },
  {
    number: "03",
    title: "Compartilhe o link",
    body: "Um link só, pronto pro Instagram e WhatsApp, com pedido/contato direto pra você.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      <header className="sticky top-0 z-40 border-b border-zinc-200/80 bg-zinc-50/80 backdrop-blur dark:border-zinc-800/80 dark:bg-zinc-950/80">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
          <span className="text-xl font-bold tracking-tight text-violet-600 dark:text-violet-400">Flip</span>
          <nav className="flex items-center gap-6">
            <a href="#modelos" className="hidden text-sm font-medium text-zinc-600 hover:text-zinc-900 sm:block dark:text-zinc-400 dark:hover:text-zinc-100">
              Modelos
            </a>
            <Link href="/dashboard/login" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
              Entrar
            </Link>
            <Link
              href="/dashboard/signup"
              className="rounded-full bg-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-violet-700"
            >
              Criar loja grátis
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 -top-40 -z-10 flex justify-center blur-3xl"
          >
            <div className="aspect-[1155/678] w-[72rem] bg-gradient-to-tr from-violet-400 via-fuchsia-300 to-amber-200 opacity-40 dark:opacity-20" />
          </div>

          <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-6 px-6 pb-20 pt-20 text-center sm:pt-28">
            <span className="rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-violet-700 dark:border-violet-900 dark:bg-violet-950 dark:text-violet-300">
              Catálogo digital em minutos
            </span>
            <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-6xl">
              O catálogo da sua loja,<br className="hidden sm:block" /> pronto pra compartilhar
            </h1>
            <p className="max-w-xl text-lg text-zinc-600 dark:text-zinc-400">
              Cadastre seus produtos ou serviços, escolha um modelo pronto e ganhe um link único —
              feito pro Instagram e o WhatsApp.
            </p>
            <div className="mt-2 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/dashboard/signup"
                className="rounded-full bg-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-violet-600/20 transition-colors hover:bg-violet-700"
              >
                Criar minha loja
              </Link>
              <a
                href="#modelos"
                className="rounded-full border border-zinc-300 px-6 py-3 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900"
              >
                Ver modelos
              </a>
            </div>
          </div>
        </section>

        {/* Como funciona */}
        <section className="border-t border-zinc-200 bg-white py-20 dark:border-zinc-800 dark:bg-zinc-900/40">
          <div className="mx-auto w-full max-w-5xl px-6">
            <h2 className="text-center text-sm font-semibold uppercase tracking-wide text-violet-600 dark:text-violet-400">
              Como funciona
            </h2>
            <div className="mt-10 grid gap-8 sm:grid-cols-3">
              {STEPS.map((step) => (
                <div key={step.number} className="flex flex-col gap-2">
                  <span className="text-3xl font-bold text-violet-200 dark:text-violet-900">{step.number}</span>
                  <h3 className="text-lg font-semibold">{step.title}</h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">{step.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Modelos */}
        <section id="modelos" className="py-20">
          <div className="mx-auto w-full max-w-5xl px-6">
            <h2 className="text-center text-sm font-semibold uppercase tracking-wide text-violet-600 dark:text-violet-400">
              Modelos prontos
            </h2>
            <p className="mx-auto mt-2 max-w-lg text-center text-2xl font-bold tracking-tight">
              Um visual pronto pro seu tipo de negócio
            </p>

            <div className="mt-10 grid gap-6 sm:grid-cols-3">
              {templateManifests.map((template) => (
                <div
                  key={template.slug}
                  className="flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <div
                    className="flex h-40 flex-col items-center justify-center gap-2 px-6 text-center"
                    style={{
                      background: `radial-gradient(120% 120% at 50% 0%, ${template.defaultTheme.colors.primary}33, transparent 70%), ${template.defaultTheme.colors.background}`,
                      color: template.defaultTheme.colors.ink,
                    }}
                  >
                    <span
                      className="flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold"
                      style={{ background: template.defaultTheme.colors.primary, color: template.defaultTheme.colors.background }}
                    >
                      {template.name.charAt(0)}
                    </span>
                    <span className="text-sm font-medium" style={{ color: template.defaultTheme.colors.textDim }}>
                      {template.businessType === "catalog" ? "Catálogo" : "Vitrine"}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col gap-2 p-5">
                    <h3 className="font-semibold">{template.name}</h3>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">{template.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA final */}
        <section className="border-t border-zinc-200 bg-zinc-900 py-20 dark:border-zinc-800">
          <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-6 px-6 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white">Pronto pra ter seu catálogo?</h2>
            <p className="text-zinc-400">Grátis pra começar. Leva menos de 2 minutos.</p>
            <Link
              href="/dashboard/signup"
              className="rounded-full bg-violet-500 px-6 py-3 text-sm font-semibold text-white shadow-md transition-colors hover:bg-violet-400"
            >
              Criar minha loja
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-zinc-200 py-8 dark:border-zinc-800">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-2 px-6 text-center text-sm text-zinc-500">
          <span className="font-semibold text-zinc-700 dark:text-zinc-300">Flip</span>
          <span>Um produto Marcato.</span>
        </div>
      </footer>
    </div>
  );
}
