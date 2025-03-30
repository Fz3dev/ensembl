import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Récupérer la session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // URL de la requête
  const url = req.nextUrl.clone()
  const { pathname } = url

  // Routes protégées qui nécessitent une authentification
  const protectedRoutes = ["/", "/profile", "/family", "/settings"]

  // Routes d'authentification (accessibles uniquement si NON authentifié)
  const authRoutes = ["/auth/login", "/auth/signup", "/auth/forgot-password"]

  // Vérifier si l'utilisateur tente d'accéder à une route protégée sans être authentifié
  if (protectedRoutes.some((route) => pathname.startsWith(route)) && !session) {
    url.pathname = "/auth/login"
    url.searchParams.set("redirectTo", pathname)
    return NextResponse.redirect(url)
  }

  // Vérifier si l'utilisateur authentifié tente d'accéder à une route d'authentification
  if (authRoutes.some((route) => pathname === route) && session) {
    url.pathname = "/"
    return NextResponse.redirect(url)
  }

  return res
}

// Configurer les chemins sur lesquels le middleware doit s'exécuter
export const config = {
  matcher: ["/", "/profile", "/family/:path*", "/settings/:path*", "/auth/:path*"],
}

