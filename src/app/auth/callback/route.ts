import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * The single Supabase Auth email-link landing route for this app (invite,
 * and any future recovery link) — exchanges the PKCE `code` for a real
 * session (writing the session cookie via the server client), then routes
 * by the `type` Supabase appends to the redirect: an invite link lands on
 * the branded first-password setup screen, everything else falls back to
 * the Admin root (which itself redirects to /login if there's no session).
 *
 * This route grants no operational access by itself — it only ever
 * establishes a session; /invite/set-password separately verifies the
 * profile is genuinely still Invited before showing anything.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const type = url.searchParams.get("type");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return NextResponse.redirect(new URL("/login?inactive=1", url.origin));
    }
  }

  const next = type === "invite" ? "/invite/set-password" : "/";
  return NextResponse.redirect(new URL(next, url.origin));
}
