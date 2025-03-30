"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser } from "@/utils/supabase/client"
import { ArrowRight, Calendar as CalendarIcon, Users, Clock } from "lucide-react"

export default function HomePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadUser() {
      try {
        const currentUser = await getCurrentUser()
        setUser(currentUser)
        console.log("Utilisateur chargé:", currentUser?.id)
        
        // Récupérer les infos de débogage si disponibles
        try {
          const debugInfo = localStorage.getItem('auth_debug')
          if (debugInfo) {
            console.log("Infos de débogage d'authentification:", JSON.parse(debugInfo))
          }
        } catch (e) {
          console.error("Erreur lors de la récupération des infos de débogage:", e)
        }
        
        // Ne pas rediriger automatiquement les utilisateurs connectés
        // Laisser l'accès à la page d'accueil pour tous les utilisateurs
      } catch (error) {
        console.error("Erreur lors du chargement de l'utilisateur:", error)
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [router])

  if (loading) {
    return (
      <div className="container flex items-center justify-center min-h-screen">
        <div className="flex flex-col min-h-screen">
          <header className="py-6 px-4 md:px-6 bg-white border-b">
            <div className="container mx-auto flex justify-between items-center">
              <div className="flex items-center gap-3">
                <img src="/logo.png" alt="Ensemble Calendar Logo" className="h-10 w-10" />
                <h1 className="text-2xl font-bold text-primary">Ensemble Calendar</h1>
              </div>
              <div className="space-x-4">
                <a
                  href="/auth/login"
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
                >
                  Se connecter
                </a>
                <a
                  href="/auth/signup"
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                >
                  S'inscrire
                </a>
              </div>
            </div>
          </header>
          <main className="flex-1 py-12 px-4 md:px-6">
            <div className="container mx-auto grid gap-8 md:grid-cols-2 items-center">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Organisez votre vie de famille
                </h2>
                <p className="text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Ensemble Calendar vous aide à coordonner les activités de toute la famille en un seul endroit.
                  Partagez des calendriers, assignez des tâches et restez synchronisés.
                </p>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <a
                    href="/auth/signup"
                    className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                  >
                    Commencer
                  </a>
                </div>
              </div>
              <div className="mx-auto max-w-sm">
                <div className="rounded-xl border bg-card text-card-foreground shadow">
                  <div className="p-6">
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <h3 className="text-xl font-bold">Fonctionnalités</h3>
                        <p className="text-sm text-gray-500">
                          Tout ce dont vous avez besoin pour organiser votre famille
                        </p>
                      </div>
                      <ul className="grid gap-2">
                        <li className="flex items-center gap-2">
                          <CalendarIcon className="h-4 w-4 text-primary" />
                          <span className="text-sm">Calendrier partagé</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-primary" />
                          <span className="text-sm">Assignation de tâches</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-primary" />
                          <span className="text-sm">Rappels et notifications</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <ArrowRight className="h-4 w-4 text-primary" />
                          <span className="text-sm">Interface adaptée aux enfants</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
          <footer className="py-6 px-4 md:px-6 border-t">
            <div className="container mx-auto flex flex-col gap-4 md:flex-row md:gap-8">
              <p className="text-xs text-gray-500">
                2025 Ensemble Calendar. Tous droits réservés.
              </p>
              <nav className="flex gap-4 md:ml-auto">
                <a href="#" className="text-xs text-gray-500 hover:underline">
                  Confidentialité
                </a>
                <a href="#" className="text-xs text-gray-500 hover:underline">
                  Conditions d'utilisation
                </a>
                <a href="#" className="text-xs text-gray-500 hover:underline">
                  Contact
                </a>
              </nav>
            </div>
          </footer>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="py-6 px-4 md:px-6 bg-white border-b">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Ensemble Calendar Logo" className="h-10 w-10" />
            <h1 className="text-2xl font-bold text-primary">Ensemble Calendar</h1>
          </div>
          <div className="space-x-4">
            <a
              href="/auth/login"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
            >
              Se connecter
            </a>
            <a
              href="/auth/signup"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            >
              S'inscrire
            </a>
          </div>
        </div>
      </header>
      <main className="flex-1 py-12 px-4 md:px-6">
        <div className="container mx-auto grid gap-8 md:grid-cols-2 items-center">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Organisez votre vie de famille
            </h2>
            <p className="text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Ensemble Calendar vous aide à coordonner les activités de toute la famille en un seul endroit.
              Partagez des calendriers, assignez des tâches et restez synchronisés.
            </p>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <a
                href="/auth/signup"
                className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
              >
                Commencer
              </a>
            </div>
          </div>
          <div className="mx-auto max-w-sm">
            <div className="rounded-xl border bg-card text-card-foreground shadow">
              <div className="p-6">
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <h3 className="text-xl font-bold">Fonctionnalités</h3>
                    <p className="text-sm text-gray-500">
                      Tout ce dont vous avez besoin pour organiser votre famille
                    </p>
                  </div>
                  <ul className="grid gap-2">
                    <li className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-primary" />
                      <span className="text-sm">Calendrier partagé</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" />
                      <span className="text-sm">Assignation de tâches</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" />
                      <span className="text-sm">Rappels et notifications</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <ArrowRight className="h-4 w-4 text-primary" />
                      <span className="text-sm">Interface adaptée aux enfants</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <footer className="py-6 px-4 md:px-6 border-t">
        <div className="container mx-auto flex flex-col gap-4 md:flex-row md:gap-8">
          <p className="text-xs text-gray-500">
            2025 Ensemble Calendar. Tous droits réservés.
          </p>
          <nav className="flex gap-4 md:ml-auto">
            <a href="#" className="text-xs text-gray-500 hover:underline">
              Confidentialité
            </a>
            <a href="#" className="text-xs text-gray-500 hover:underline">
              Conditions d'utilisation
            </a>
            <a href="#" className="text-xs text-gray-500 hover:underline">
              Contact
            </a>
          </nav>
        </div>
      </footer>
    </div>
  )
}
