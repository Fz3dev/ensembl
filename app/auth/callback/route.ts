import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') || ''

  if (code) {
    const cookieStore = cookies()
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name) {
            return cookieStore.get(name)?.value
          },
          set(name, value, options) {
            cookieStore.set(name, value, options)
          },
          remove(name, options) {
            cookieStore.delete(name)
          },
        },
      }
    )
    
    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      if (error) {
        console.error('Erreur lors de l\'échange du code:', error)
        return NextResponse.redirect(`${origin}/auth/login?error=Échec de l'authentification`)
      }
      
      // Récupérer l'utilisateur actuel
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // Vérifier si l'utilisateur a déjà une famille
        const { data: familyData, error: familyError } = await supabase
          .from('family_members')
          .select('family_id')
          .eq('user_id', user.id)
          .limit(1)
        
        if (familyError) {
          console.error("Erreur lors de la vérification de la famille:", familyError)
          // En cas d'erreur, rediriger vers l'onboarding par sécurité
          return NextResponse.redirect(`${origin}/onboarding/family-setup`)
        }
        
        // Si un next est spécifié, l'utiliser
        if (next) {
          return NextResponse.redirect(`${origin}${next}`)
        }
        
        // Sinon, rediriger en fonction de l'appartenance à une famille
        if (familyData && familyData.length > 0) {
          console.log("Utilisateur avec famille, redirection vers le dashboard")
          return NextResponse.redirect(`${origin}/dashboard`)
        } else {
          console.log("Nouvel utilisateur, redirection vers l'onboarding")
          return NextResponse.redirect(`${origin}/onboarding/family-setup`)
        }
      }
    } catch (e) {
      console.error('Exception lors de l\'échange du code:', e)
      return NextResponse.redirect(`${origin}/auth/login?error=Erreur inattendue`)
    }
  }

  // Redirection par défaut si aucun code n'est fourni
  return NextResponse.redirect(`${origin}/auth/login`)
}
