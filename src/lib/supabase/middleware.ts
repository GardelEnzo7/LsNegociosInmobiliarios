import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  // A stale/invalid refresh token (leftover cookies from a previous
  // environment, a rotated Supabase project, or an expired session) makes
  // getUser() log "AuthApiError: Invalid Refresh Token" on every request
  // without ever resolving. Clearing the auth cookies here stops the spam;
  // the user is already being treated as logged out below either way, and a
  // valid session's cookies are never touched since this branch only runs
  // when Supabase itself reports the token as dead.
  if (authError?.code === "refresh_token_not_found") {
    for (const cookie of request.cookies.getAll()) {
      if (cookie.name.startsWith("sb-")) {
        response.cookies.delete(cookie.name);
      }
    }
  }

  if (!user && request.nextUrl.pathname.startsWith("/admin") && request.nextUrl.pathname !== "/admin/login") {
    const loginUrl = new URL("/admin/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (user && request.nextUrl.pathname === "/admin/login") {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return response;
}
