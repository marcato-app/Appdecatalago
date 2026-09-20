import { asc, eq, inArray } from "drizzle-orm";
import { db } from "@/db/client";
import { blocks, blockItems } from "@/db/schema";
import type { BlockType } from "@/templates/types";

export interface BlockItemDto {
  id: string;
  position: number;
  imageUrl: string | null;
  title: string | null;
  subtitle: string | null;
  body: string | null;
  meta: Record<string, unknown>;
}

export interface BlockDto {
  id: string;
  type: BlockType;
  position: number;
  visible: boolean;
  settings: Record<string, unknown>;
  items: BlockItemDto[];
}

/** Blocks + their items for a store, ordered and grouped — the shape both
 * the public portfolio templates and the dashboard content manager
 * (/dashboard/loja/conteudo) read. Blocks are provisioned once at store
 * creation (one per manifest.blocks[] entry, see
 * app/dashboard/loja/nova/actions.ts) so this never needs to invent rows. */
export async function getStoreBlocks(storeId: string): Promise<BlockDto[]> {
  const storeBlocks = await db.select().from(blocks).where(eq(blocks.storeId, storeId)).orderBy(asc(blocks.position));
  if (storeBlocks.length === 0) return [];

  const blockIds = storeBlocks.map((b) => b.id);
  const items = await db
    .select()
    .from(blockItems)
    .where(inArray(blockItems.blockId, blockIds))
    .orderBy(asc(blockItems.position));

  const itemsByBlock = new Map<string, BlockItemDto[]>();
  for (const item of items) {
    const list = itemsByBlock.get(item.blockId) ?? [];
    list.push({
      id: item.id,
      position: item.position,
      imageUrl: item.imageUrl,
      title: item.title,
      subtitle: item.subtitle,
      body: item.body,
      meta: (item.meta as Record<string, unknown>) ?? {},
    });
    itemsByBlock.set(item.blockId, list);
  }

  return storeBlocks.map((block) => ({
    id: block.id,
    type: block.type,
    position: block.position,
    visible: block.visible,
    settings: (block.settings as Record<string, unknown>) ?? {},
    items: itemsByBlock.get(block.id) ?? [],
  }));
}

export function findBlock(blocksList: BlockDto[], type: BlockType): BlockDto | undefined {
  return blocksList.find((b) => b.type === type && b.visible);
}
