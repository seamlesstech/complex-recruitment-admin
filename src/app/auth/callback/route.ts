import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * The single Supabase Auth email-link landing route for this app (invite,
 * and any future recovery link).
 *
 * Two link shapes are handled, both establishing the real session via the
 * cookie-aware server client before redirecting:
 *
 * - `token_hash` + `type=invite`: what Supabase's Invite User template
 *   actually sends once its link points at `.RedirectTo` with `.TokenHash`
 *   (see the required template change documented alongside this route) —
 *   verified server-side with verifyOtp(), which is the documented SSR
 *   approach and never puts the session in a URL fragment the server can't
 *   see. Only the literal "invite" type is accepted here, not whatever the
 *   query string happens to say, so this path can't be repurposed to run a
 *   different OTP verification than the one it's meant for.
 * - `code`: kept for any other Supabase email flow (e.g. a future
 *   password-recovery link) that still uses the PKCE code-exchange shape.
 *
 * Either way, the token/code lives only in the one incoming request URL —
 * the redirect this handler issues never carries it, so it never reaches
 * the browser's address bar past this hop.
 *
 * This route grants no operational access by itself — it only ever
 * establishes a session; /invite/set-password separately verifies the
 * profile is genuinely still Invited before showing anything.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type");
  const code = url.searchParams.get("code");

  const supabase = await createClient();

  if (tokenHash && type === "invite") {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: "invite" });
    if (error) {
      return NextResponse.redirect(new URL("/login?inactive=1", url.origin));
    }
    return NextResponse.redirect(new URL("/invite/set-password", url.origin));
  }

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return NextResponse.redirect(new URL("/login?inactive=1", url.origin));
    }
  }

  const next = type === "invite" ? "/invite/set-password" : "/";
  return NextResponse.redirect(new URL(next, url.origin));
}
