import { getCloudflareContext } from "@opennextjs/cloudflare";

// Serves files from the private R2 bucket (lib/uploads.ts writes them) —
// no r2.dev/custom domain needed, the Worker just streams the object back
// with cache headers. Keys are random UUIDs (see uploadImageAction), so a
// long, immutable cache lifetime is safe: a key is never reused for
// different content.
export async function GET(_request: Request, { params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const { env } = await getCloudflareContext({ async: true });

  const object = await env.UPLOADS.get(key);
  if (!object) {
    return new Response("Not found", { status: 404 });
  }

  return new Response(object.body, {
    headers: {
      "Content-Type": object.httpMetadata?.contentType ?? "application/octet-stream",
      "Cache-Control": "public, max-age=31536000, immutable",
      ETag: object.httpEtag,
    },
  });
}
