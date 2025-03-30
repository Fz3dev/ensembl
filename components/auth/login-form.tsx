"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Loader2 } from "lucide-react"
import Link from "next/link"

export default function LoginForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [isClient, setIsClient] = useState(false)

  // Vérifier si nous sommes côté client
  useEffect(() => {
    setIsClient(true)
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      console.log("Tentative de connexion avec:", formData.email)

      // Utiliser directement l'API Supabase pour la connexion
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })

      if (error) {
        console.error("Erreur lors de la connexion:", error.message)
        setError(error.message)
        setIsLoading(false)
        return
      }

      console.log("Connexion réussie, utilisateur:", data?.user?.id)
      
      if (data?.user) {
        // Stocker les informations de session dans le localStorage pour déboguer
        try {
          localStorage.setItem('auth_debug', JSON.stringify({
            userId: data.user.id,
            email: data.user.email,
            timestamp: new Date().toISOString()
          }))
        } catch (e) {
          console.error("Erreur lors du stockage des infos de débogage:", e)
        }
        
        // Vérifier si l'utilisateur a déjà une famille
        try {
          const { data: familyData, error: familyError } = await supabase
            .from('family_members')
            .select('family_id')
            .eq('user_id', data.user.id)
            .limit(1)
          
          if (familyError) {
            console.error("Erreur lors de la vérification de la famille:", familyError)
            // En cas d'erreur de requête, diriger vers l'onboarding par sécurité
            router.push("/onboarding/family-setup")
            return
          }
          
          // Attendre un court instant pour s'assurer que la session est bien établie
          await new Promise(resolve => setTimeout(resolve, 500))
          
          // Redirection basée sur l'appartenance à une famille
          if (familyData && familyData.length > 0) {
            console.log("Utilisateur avec famille, redirection vers le dashboard")
            router.push("/dashboard")
          } else {
            console.log("Nouvel utilisateur, redirection vers l'onboarding")
            router.push("/onboarding/family-setup")
          }
        } catch (err) {
          console.error("Erreur lors de la vérification de la famille:", err)
          // En cas d'erreur, rediriger vers l'onboarding par défaut
          router.push("/onboarding/family-setup")
        }
      }
    } catch (err) {
      console.error("Exception lors de la connexion:", err)
      setError("Une erreur s'est produite lors de la connexion. Veuillez réessayer.")
    } finally {
      setIsLoading(false)
    }
  }

  // Si nous sommes en rendu côté serveur ou si le client n'est pas encore initialisé
  if (!isClient) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Connexion</CardTitle>
          <CardDescription>Chargement du formulaire de connexion...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Connexion</CardTitle>
        <CardDescription>Connectez-vous à votre compte Ensemble</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="jean.dupont@exemple.fr"
              autoComplete="email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              autoComplete="current-password"
            />
            <div className="text-right">
              <Link href="/auth/forgot-password" className="text-sm text-primary hover:underline">
                Mot de passe oublié?
              </Link>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connexion en cours...
              </>
            ) : (
              "Se connecter"
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          Vous n'avez pas de compte?{" "}
          <Link href="/auth/signup" className="text-primary hover:underline">
            Créer un compte
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}
