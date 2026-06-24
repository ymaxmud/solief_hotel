import { type NextRequest, NextResponse } from "next/server";

function redirectToLogin(request: NextRequest) {
  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/admin/login";
  loginUrl.searchParams.set("next", request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request });
  const isAdminPath = request.nextUrl.pathname.startsWith("/admin");
  const isLoginPath = request.nextUrl.pathname === "/admin/login";
  if (!isAdminPath || isLoginPath) return response;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return redirectToLogin(request);

  const hasSupabaseSessionCookie = request.cookies.getAll().some((cookie) => cookie.name.startsWith("sb-"));
  if (!hasSupabaseSessionCookie) return redirectToLogin(request);

  return response;
}

export const config = {
  matcher: ["/admin/:path*"]
};
