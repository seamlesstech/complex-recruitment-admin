import { NextResponse, type NextRequest } from "next/server";
import { createDocumentAccessUrl } from "@/lib/documents/access";

/**
 * GET /api/documents/{candidateDocumentId}?mode=view|download
 *
 * Authorizes the current admin user for one candidate document and redirects
 * to a freshly minted, short-lived signed URL (see lib/documents/access.ts).
 * Accepts a document id only — never a Storage path — and stores nothing.
 */
const NO_STORE = {
  "Cache-Control": "no-store, private",
  "Referrer-Policy": "no-referrer",
};

const MESSAGES: Record<401 | 403 | 404 | 500, string> = {
  401: "Please sign in to access documents.",
  403: "Your role does not have access to candidate documents.",
  404: "This document could not be found.",
  500: "This document could not be opened. Please try again.",
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const mode = request.nextUrl.searchParams.get("mode") === "view" ? "view" : "download";

  const result = await createDocumentAccessUrl(id, mode);
  if (!result.ok) {
    return new NextResponse(MESSAGES[result.status], {
      status: result.status,
      headers: { ...NO_STORE, "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const response = NextResponse.redirect(result.url, 303);
  Object.entries(NO_STORE).forEach(([key, value]) => response.headers.set(key, value));
  return response;
}
