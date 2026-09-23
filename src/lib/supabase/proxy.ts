import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Refreshes the Supabase Auth session on every request and performs the
 * "optimistic" (cookie/JWT-only, no app-database call) half of route
 * protection: is there a verified Supabase Auth session at all.
 *
 * The deeper check — is this profile's status = 'active' in public.profiles —
 * is deliberately NOT done here (Proxy runs on every request, including
 * prefetches, so it should stay fast and avoid extra DB round trips); it
 * happens in the (admin) route group's layout via the Data Access Layer,
 * which is the "secure" check per Next.js's own authentication guidance.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  // With Fluid compute, don't put this client in a global environment
  // variable. Always create a new one on each request.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
          Object.entries(headers).forEach(([key, value]) =>
            supabaseResponse.headers.set(key, value),
          );
        },
      },
    },
  );

  // Do not run code between createServerClient and supabase.auth.getClaims().
  // A simple mistake could make it very hard to debug issues with users
  // being randomly logged out.
  //
  // IMPORTANT: getClaims() (not getSession()) is what actually verifies the
  // JWT rather than trusting whatever the cookie says — anyone can forge a
  // cookie, so an unverified read would let an attacker render another
  // user's page.
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  const pathname = request.nextUrl.pathname;
  const isLoginRoute = pathname === "/login";

  if (!user && !isLoginRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user && isLoginRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return NextResponse.redirect(url);
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is. If
  // you're creating a new response object, make sure to copy over the
  // cookies and re-apply any changes, or the browser and server can go out
  // of sync and terminate the user's session prematurely.
  return supabaseResponse;
}
