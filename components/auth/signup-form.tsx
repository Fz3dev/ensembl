"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { signUp } from "@/utils/supabase/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Loader2, CheckCircle } from "lucide-react"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function SignUpForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
  })
  const [isClient, setIsClient] = useState(false)

  // Vérifier si nous sommes côté client
  useEffect(() => {
    setIsClient(true)
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Réinitialiser les messages d'erreur lors de la modification
    setError(null)
  }

  const validateForm = () => {
    // Vérification des champs vides
    if (!formData.email || !formData.password || !formData.firstName || !formData.lastName) {
      setError("Tous les champs sont obligatoires")
      return false
    }

    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError("Format d'email invalide")
      return false
    }

    // Validation du mot de passe
    if (formData.password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères")
      return false
    }

    // Vérification de la correspondance des mots de passe
    if (formData.password !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas")
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Réinitialiser les états
    setError(null)
    setSuccess(null)

    // Valider le formulaire
    if (!validateForm()) return

    setIsLoading(true)

    try {
      const { data, error } = await signUp(formData.email, formData.password, formData.firstName, formData.lastName)

      if (error) {
        setError(error.message || "Une erreur s'est produite lors de l'inscription")
        return
      }

      // Vérifier si l'email de confirmation est nécessaire
      if (data?.user && data.user.identities?.length === 0) {
        setError("Cet email est déjà utilisé")
        return
      }

      if (data?.user) {
        setSuccess(
          "Votre compte a été créé avec succès. Vous allez être redirigé vers la page de connexion.",
        )
        // Afficher la modale de succès
        setShowSuccessModal(true)
        
        // Rediriger vers la page de connexion après un court délai
        setTimeout(() => {
          router.push("/auth/login")
        }, 3000)
      }
    } catch (err) {
      console.error("Erreur lors de l'inscription:", err)
      setError("Une erreur inattendue s'est produite")
    } finally {
      setIsLoading(false)
    }
  }

  // Fonction pour gérer la redirection après confirmation
  const handleRedirectToLogin = () => {
    router.push("/auth/login")
  }

  // Si nous sommes en rendu côté serveur ou si le client n'est pas encore initialisé
  if (!isClient) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Créer un compte</CardTitle>
          <CardDescription>Chargement du formulaire d'inscription...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Créer un compte</CardTitle>
          <CardDescription>Rejoignez Ensemble pour gérer votre calendrier familial</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && !showSuccessModal && (
              <Alert className="bg-green-50 text-green-800 border-green-200">
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Prénom</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Jean"
                  autoComplete="given-name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Nom</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Dupont"
                  autoComplete="family-name"
                />
              </div>
            </div>

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
                autoComplete="new-password"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Création en cours...
                </>
              ) : (
                "Créer un compte"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Vous avez déjà un compte?{" "}
            <Link href="/auth/login" className="text-primary hover:underline">
              Se connecter
            </Link>
          </p>
        </CardFooter>
      </Card>

      {/* Modale de confirmation de création de compte */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-green-500" />
              <span>Compte créé avec succès !</span>
            </DialogTitle>
            <DialogDescription>
              Votre compte a été créé avec succès. Vous pouvez maintenant vous connecter pour commencer à utiliser Ensemble Calendar.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center py-4">
            <div className="rounded-full bg-green-100 p-4">
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleRedirectToLogin} className="w-full">
              Se connecter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
