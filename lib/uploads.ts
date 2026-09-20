"use server";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { requireUser } from "@/lib/auth/session";

const MAX_BYTES = 6 * 1024 * 1024; // 6MB — plenty for a phone photo, small enough to stay well under the Server Action body limit (next.config.ts).

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export interface UploadImageResult {
  url?: string;
  error?: string;
}

// Stores every upload (logo, capa, produto, equipe, galeria, resultados...)
// in one flat R2 bucket under a random key — nothing here needs a folder
// structure, and the URL is opaque either way. Requires a signed-in user
// (not scoped further to "this store's own files" since there's no
// per-store ownership check on the key itself once uploaded — acceptable
// for now, same trust level as the image URL text field this replaces).
export async function uploadImageAction(formData: FormData): Promise<UploadImageResult> {
  await requireUser();

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { error: "Nenhum arquivo enviado." };
  }

  const extension = ALLOWED_TYPES[file.type];
  if (!extension) {
    return { error: "Formato não suportado. Use JPG, PNG, WEBP ou GIF." };
  }

  if (file.size > MAX_BYTES) {
    return { error: "Arquivo muito grande (máximo 6MB)." };
  }

  const { env } = await getCloudflareContext({ async: true });
  const key = `${crypto.randomUUID()}.${extension}`;

  await env.UPLOADS.put(key, await file.arrayBuffer(), {
    httpMetadata: { contentType: file.type },
  });

  return { url: `/api/uploads/${key}` };
}
