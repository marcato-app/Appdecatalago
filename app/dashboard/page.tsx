// Painel do lojista (placeholder). Fase 1 adiciona: autenticação, cadastro
// de loja, escolha de modelo e CRUD de conteúdo (categorias/produtos ou
// blocos, dependendo do business_type da loja).
export default function DashboardPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 text-center">
      <p className="text-sm text-zinc-500">Painel do lojista (placeholder)</p>
      <h1 className="text-2xl font-semibold">Painel</h1>
      <p className="max-w-sm text-sm text-zinc-500">
        Cadastro de loja, escolha de modelo e cadastro de produtos/serviços entram na Fase 1.
      </p>
    </div>
  );
}
