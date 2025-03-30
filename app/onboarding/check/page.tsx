"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { supabase } from "@/utils/supabase/client"
import { getCurrentUser } from "@/utils/supabase/client"

export default function CheckFamilyPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkFamilyMembership() {
      try {
        // 1. Vérifier si l'utilisateur est connecté
        const user = await getCurrentUser()
        
        if (!user) {
          console.log("Utilisateur non connecté, redirection vers la page de connexion")
          router.push("/auth/login")
          return
        }
        
        console.log("Utilisateur connecté:", user.id)
        
        // 2. Vérifier si l'utilisateur appartient déjà à une famille
        const { data: familyMembers, error } = await supabase
          .from("family_members")
          .select("family_id")
          .eq("user_id", user.id)
          .limit(1)
        
        if (error) {
          console.error("Erreur lors de la vérification de l'appartenance à une famille:", error)
          // En cas d'erreur, on redirige vers la création de famille par sécurité
          router.push("/onboarding/create-family")
          return
        }
        
        // 3. Rediriger en fonction du résultat
        if (familyMembers && familyMembers.length > 0) {
          // L'utilisateur appartient déjà à une famille, redirection vers le dashboard
          console.log("L'utilisateur appartient à la famille:", familyMembers[0].family_id)
          router.push("/dashboard")
        } else {
          // L'utilisateur n'appartient pas à une famille, redirection vers l'étape de création de famille
          console.log("L'utilisateur n'appartient à aucune famille, début de la création de famille")
          router.push("/onboarding/create-family")
        }
      } catch (error) {
        console.error("Erreur lors de la vérification:", error)
        // En cas d'erreur, on redirige vers la création de famille par sécurité
        router.push("/onboarding/create-family")
      } finally {
        setLoading(false)
      }
    }

    checkFamilyMembership()
  }, [router])

  return (
    <Card className="w-full">
      <CardContent className="flex flex-col items-center justify-center p-6">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-center text-muted-foreground">
          Vérification de votre compte...
        </p>
      </CardContent>
    </Card>
  )
}
