"use client";

import { useState } from "react";
import { showToast } from "@/lib/toast";

/** Copia o link completo da loja. O href público é relativo (/slug) porque
 * o app roda em mais de um domínio — o endereço absoluto só existe no
 * navegador, por isso isto é um componente de cliente. */
export function CopyLinkButton({ path }: { path: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    const url = `${window.location.origin}${path}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      showToast("Link copiado");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast("Não consegui copiar — copie da barra de endereço", true);
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="rounded-full bg-violet-600 px-4 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-violet-700"
    >
      {copied ? "Copiado ✓" : "Copiar link"}
    </button>
  );
}
