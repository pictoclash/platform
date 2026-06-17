import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Routes that require authentication
const PROTECTED_PATHS = ["/profile", "/characters/new", "/characters", "/strikes/new", "/notifications", "/admin"];

// Routes that should redirect to profile if already logged in
const AUTH_PATHS = ["/login", "/register"];

export async function updateSession(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if this route needs auth validation
  const isProtectedPath = PROTECTED_PATHS.some((path) => pathname.startsWith(path));
  const isAuthPath = AUTH_PATHS.some((path) => pathname.startsWith(path));

  // For public routes that don't need auth checks, skip Supabase call entirely
  if (!isProtectedPath && !isAuthPath) {
    return NextResponse.next({ request });
  }

  // Only create Supabase client and validate session for routes that need it
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session if expired - only for routes that need auth
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protected routes - redirect to login if not authenticated
  if (isProtectedPath && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // Auth pages - redirect to profile if already authenticated
  if (isAuthPath && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/profile";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
