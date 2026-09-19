import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
      <h1 className="text-3xl font-semibold tracking-tight">Appdecatalogo</h1>
      <p className="max-w-md text-zinc-600 dark:text-zinc-400">
        Crie o catálogo digital da sua loja: cadastre seus produtos ou serviços, escolha um
        modelo e compartilhe seu link.
      </p>
      <Link
        href="/dashboard"
        className="rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
      >
        Ir para o painel
      </Link>
    </div>
  );
}
