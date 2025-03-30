import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  // Créer une réponse non modifiée
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Créer un client Supabase avec le nouveau package SSR
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          // Si la valeur est vide ou nulle, supprimez le cookie
          if (value === "" || value === null) {
            request.cookies.delete(name);
            response.cookies.delete(name);
          } else {
            // Sinon, définissez le cookie sur la requête et la réponse
            request.cookies.set({
              name,
              value,
              ...options,
            });
            response.cookies.set({
              name,
              value,
              ...options,
            });
          }
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.delete(name);
          response.cookies.delete(name);
        },
      },
    }
  );

  // URL de la requête
  const url = request.nextUrl.clone();
  const { pathname } = url;
  
  console.log(`Middleware: traitement de la route ${pathname}`);
  
  // Routes à exclure complètement du middleware
  if (pathname.includes('/auth/callback') || 
      pathname.startsWith('/api/') || 
      pathname === '/' || 
      pathname.includes('/_next/') ||
      pathname.includes('/favicon.ico') ||
      pathname.includes('.png') ||
      pathname.includes('.jpg') ||
      pathname.includes('.svg')) {
    console.log(`Middleware: route exclue ${pathname}`);
    return response;
  }
  
  // Vérifier si nous sommes dans une boucle de redirection
  const redirectCount = parseInt(request.headers.get('x-redirect-count') || '0');
  if (redirectCount > 2) {
    console.log(`Middleware: détection de boucle de redirection (${redirectCount}), accès autorisé à ${pathname}`);
    return response;
  }
  
  try {
    // Récupérer la session avec le nouveau client Supabase
    const { data: { session } } = await supabase.auth.getSession();
    console.log(`Middleware: session ${session ? 'active' : 'inactive'} pour ${pathname}`);
    
    // Routes protégées qui nécessitent une authentification
    const protectedRoutes = ["/dashboard", "/profile", "/family", "/settings", "/onboarding"];
    
    // Routes d'authentification (accessibles uniquement si NON authentifié)
    const authRoutes = ["/auth/login", "/auth/signup", "/auth/forgot-password"];
    
    // Vérifier si l'utilisateur tente d'accéder à une route protégée sans être authentifié
    if (protectedRoutes.some(route => pathname === route || pathname.startsWith(route + "/")) && !session) {
      console.log(`Middleware: redirection vers login, route protégée ${pathname} sans session`);
      
      // Incrémenter le compteur de redirections
      const redirectUrl = new URL("/auth/login", request.url);
      redirectUrl.searchParams.set("redirectTo", pathname);
      const redirectRes = NextResponse.redirect(redirectUrl);
      redirectRes.headers.set('x-redirect-count', (redirectCount + 1).toString());
      
      return redirectRes;
    }
    
    // Vérifier si l'utilisateur authentifié tente d'accéder à une route d'authentification
    if (authRoutes.some(route => pathname === route) && session) {
      console.log(`Middleware: redirection vers dashboard, utilisateur authentifié sur ${pathname}`);
      
      // Incrémenter le compteur de redirections
      const redirectUrl = new URL("/dashboard", request.url);
      const redirectRes = NextResponse.redirect(redirectUrl);
      redirectRes.headers.set('x-redirect-count', (redirectCount + 1).toString());
      
      return redirectRes;
    }
    
    return response;
  } catch (error) {
    console.error("Middleware error:", error);
    // En cas d'erreur, permettre l'accès pour éviter les boucles de redirection
    return response;
  }
}

// Configurer les routes sur lesquelles le middleware doit s'exécuter
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}
