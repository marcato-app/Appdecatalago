import { moveBlockItemAction } from "@/app/dashboard/(painel)/loja/conteudo/actions";
import { AddBlockItemForm } from "./AddBlockItemForm";
import { DeleteBlockItemButton } from "./DeleteBlockItemButton";
import type { BlockDto, BlockItemDto } from "@/lib/blocks";

function itemLabel(item: BlockItemDto): string {
  return item.title ?? item.body?.slice(0, 30) ?? "item";
}

export function BlockSection({ block, label, maxItems }: { block: BlockDto; label: string; maxItems?: number }) {
  const canAddMore = maxItems === undefined || block.items.length < maxItems;

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="text-lg font-semibold">{label}</h2>

      <div className="mt-2 flex flex-col divide-y divide-zinc-100 dark:divide-zinc-800">
        {block.items.length === 0 ? <p className="py-2 text-sm text-zinc-500">Nada ainda.</p> : null}
        {block.items.map((item) => (
          <div key={item.id} className="flex items-center justify-between gap-3 py-2">
            <BlockItemPreview type={block.type} item={item} />
            <div className="flex shrink-0 items-center gap-1 text-sm">
              <form action={moveBlockItemAction}>
                <input type="hidden" name="itemId" value={item.id} />
                <input type="hidden" name="direction" value="up" />
                <button type="submit" className="px-1 text-zinc-500 hover:text-foreground" aria-label="Mover para cima">
                  ↑
                </button>
              </form>
              <form action={moveBlockItemAction}>
                <input type="hidden" name="itemId" value={item.id} />
                <input type="hidden" name="direction" value="down" />
                <button type="submit" className="px-1 text-zinc-500 hover:text-foreground" aria-label="Mover para baixo">
                  ↓
                </button>
              </form>
              <DeleteBlockItemButton itemId={item.id} confirmLabel={itemLabel(item)} />
            </div>
          </div>
        ))}
      </div>

      {canAddMore ? (
        <div className="mt-3">
          <AddBlockItemForm blockId={block.id} blockType={block.type} />
        </div>
      ) : (
        <p className="mt-3 text-xs text-zinc-400">Limite de {maxItems} atingido — exclua um item pra adicionar outro.</p>
      )}
    </div>
  );
}

function BlockItemPreview({ type, item }: { type: BlockDto["type"]; item: BlockItemDto }) {
  switch (type) {
    case "team":
      return (
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{item.title}</p>
          <p className="text-sm text-zinc-500">{item.subtitle}</p>
        </div>
      );
    case "gallery":
      return <p className="min-w-0 truncate text-sm text-zinc-500">{item.imageUrl}</p>;
    case "stats":
      return (
        <div className="min-w-0">
          <p className="text-sm font-medium">{item.title}</p>
          <p className="text-sm text-zinc-500">{item.subtitle}</p>
        </div>
      );
    case "chips":
      return <p className="text-sm font-medium">{item.title}</p>;
    case "results_carousel":
      return (
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{item.title}</p>
          <p className="truncate text-sm text-zinc-500">{item.body}</p>
        </div>
      );
    case "about":
      return <p className="truncate text-sm text-zinc-500">{item.body}</p>;
    case "reviews": {
      const stars = typeof item.meta.stars === "number" ? item.meta.stars : 5;
      return (
        <p className="truncate text-sm text-zinc-500">
          &ldquo;{item.body}&rdquo; ({stars}★)
        </p>
      );
    }
    default:
      return null;
  }
}
