"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Home, Users } from "lucide-react"
import { supabase } from "@/utils/supabase/client"
import { getCurrentUser } from "@/utils/supabase/client"

export default function CreateFamilyPage() {
  const router = useRouter()
  const [familyName, setFamilyName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!familyName.trim()) {
      setError("Veuillez entrer un nom pour votre famille")
      return
    }
    
    setIsLoading(true)
    setError(null)
    
    try {
      // 1. Récupérer l'utilisateur actuel
      const user = await getCurrentUser()
      
      if (!user) {
        setError("Vous devez être connecté pour créer une famille")
        router.push("/auth/login")
        return
      }
      
      // 2. Créer une nouvelle famille
      const { data: family, error: familyError } = await supabase
        .from("families")
        .insert([{ name: familyName.trim() }])
        .select()
      
      if (familyError) {
        throw new Error(`Erreur lors de la création de la famille: ${familyError.message}`)
      }
      
      if (!family || family.length === 0) {
        throw new Error("Erreur lors de la création de la famille: aucune donnée retournée")
      }
      
      const familyId = family[0].id
      
      // 3. Ajouter l'utilisateur comme membre admin de la famille
      const { error: memberError } = await supabase
        .from("family_members")
        .insert([{
          family_id: familyId,
          user_id: user.id,
          role: "admin"
        }])
      
      if (memberError) {
        throw new Error(`Erreur lors de l'ajout du membre à la famille: ${memberError.message}`)
      }
      
      // 4. Rediriger vers l'étape suivante
      router.push(`/onboarding/family-setup?family_id=${familyId}`)
      
    } catch (err: any) {
      console.error("Erreur:", err)
      setError(err.message || "Une erreur est survenue lors de la création de votre famille")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mx-auto mb-4">
          <Home className="h-6 w-6" />
        </div>
        <CardTitle className="text-center">Créez votre famille</CardTitle>
        <CardDescription className="text-center">
          Donnez un nom à votre espace familial pour commencer
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="familyName">Nom de la famille</Label>
            <Input
              id="familyName"
              placeholder="Ex: Famille Dupont"
              value={familyName}
              onChange={(e) => setFamilyName(e.target.value)}
              autoComplete="off"
              autoFocus
            />
          </div>
          
          {error && (
            <div className="text-sm text-red-500 text-center">
              {error}
            </div>
          )}
        </form>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          onClick={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Création en cours...
            </>
          ) : (
            "Continuer"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
