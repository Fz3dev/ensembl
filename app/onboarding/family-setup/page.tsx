"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Baby, Users, ArrowRight } from "lucide-react"
import { supabase } from "@/utils/supabase/client"
import confetti from 'canvas-confetti'
import ChildForm, { ChildFormData } from "@/components/onboarding/child-form"
import InviteForm from "@/components/onboarding/invite-form"

export default function FamilySetupPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const familyId = searchParams.get("family_id")
  
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("children")
  const [children, setChildren] = useState<ChildFormData[]>([
    { firstName: "", color: "#FF5733" }
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    async function checkAuth() {
      try {
        // Vérifier si l'utilisateur est connecté
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          console.log("Utilisateur non connecté, redirection vers login")
          router.push("/auth/login?redirectTo=/onboarding/family-setup")
          return
        }
        
        console.log("Utilisateur connecté:", user.id)
        setUser(user)
      } catch (error) {
        console.error("Erreur lors de la vérification de l'authentification:", error)
      } finally {
        setLoading(false)
      }
    }
    
    checkAuth()
  }, [])
  
  useEffect(() => {
    // Vérifier que l'ID de famille est présent
    if (!familyId) {
      router.push("/onboarding/create-family")
    }
  }, [familyId, router])
  
  if (loading) {
    return (
      <div className="container flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="mt-2 text-muted-foreground">Chargement...</p>
        </div>
      </div>
    )
  }

  const handleError = (message: string) => {
    setError(message)
  }

  // Soumission du formulaire
  const handleSubmit = async () => {
    // Filtrer les enfants sans nom
    const validChildren = children.filter(child => child.firstName.trim() !== "")
    
    setIsLoading(true)
    setError(null)
    
    try {
      if (validChildren.length > 0) {
        // Insérer les enfants valides dans la base de données
        const { error: childrenError } = await supabase
          .from("children")
          .insert(
            validChildren.map(child => ({
              family_id: familyId,
              first_name: child.firstName.trim(),
              color: child.color
            }))
          )
        
        if (childrenError) {
          throw new Error(`Erreur lors de l'ajout des enfants: ${childrenError.message}`)
        }
      }
      
      // Lancer des confettis pour célébrer la fin de l'onboarding
      const duration = 2 * 1000
      const end = Date.now() + duration
      
      const frame = () => {
        confetti({
          particleCount: 2,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#ff0000', '#00ff00', '#0000ff']
        })
        
        confetti({
          particleCount: 2,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#ff0000', '#00ff00', '#0000ff']
        })
        
        if (Date.now() < end) {
          requestAnimationFrame(frame)
        }
      }
      
      frame()
      
      // Rediriger vers le tableau de bord après un court délai
      // Utiliser setTimeout pour laisser le temps aux confettis de s'afficher
      setTimeout(() => {
        // Vérifier que la session est toujours active avant la redirection
        const checkSession = async () => {
          try {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
              // Session active, redirection vers le dashboard
              router.push("/dashboard");
            } else {
              // Session expirée, redirection vers la page de connexion
              const message = encodeURIComponent("Votre famille a été créée avec succès. Veuillez vous reconnecter.");
              router.push(`/auth/login?message=${message}`);
            }
          } catch (error) {
            console.error("Erreur lors de la vérification de la session:", error);
            const message = encodeURIComponent("Votre famille a été créée avec succès. Veuillez vous reconnecter.");
            router.push(`/auth/login?message=${message}`);
          }
        };
        
        checkSession();
      }, 1500);
      
    } catch (err: any) {
      console.error("Erreur:", err)
      setError(err.message || "Une erreur est survenue lors de l'enregistrement")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-center">Configuration de votre famille</CardTitle>
        <CardDescription className="text-center">
          Ajoutez des enfants et invitez un autre parent
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 w-full mb-6">
            <TabsTrigger value="children" className="flex items-center">
              <Baby className="h-4 w-4 mr-2" />
              Enfants
            </TabsTrigger>
            <TabsTrigger value="invite" className="flex items-center">
              <Users className="h-4 w-4 mr-2" />
              Invitation
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="children">
            <ChildForm 
              children={children} 
              onChange={setChildren} 
            />
            
            <div className="flex justify-end mt-6">
              <Button 
                type="button" 
                onClick={() => setActiveTab("invite")}
                className="flex items-center"
              >
                Suivant
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="invite">
            <InviteForm 
              familyId={familyId} 
              onError={handleError} 
            />
            
            <div className="flex justify-between mt-6">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => setActiveTab("children")}
              >
                Retour
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Finalisation...
                  </>
                ) : (
                  "Terminer"
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
        
        {error && (
          <div className="text-sm text-red-500 text-center mt-4">
            {error}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
