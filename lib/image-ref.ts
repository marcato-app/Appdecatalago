import { z } from "zod";

// An image field can hold either our own upload path (/api/uploads/<key>,
// see lib/uploads.ts) or a full URL — stores created before uploads existed
// may still have a pasted URL saved, and this keeps those valid too.
export function isValidImageRef(value: string): boolean {
  if (value.startsWith("/api/uploads/")) return true;
  return z.string().url().safeParse(value).success;
}

export const imageRefSchema = z.string().trim().refine(isValidImageRef, { message: "URL da imagem inválida." });
