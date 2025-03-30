"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { getCurrentUser } from "@/utils/supabase/client"
import { Calendar as CalendarIcon, Users, Clock } from "lucide-react"
import { supabase } from "@/utils/supabase/client"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [creatingProfile, setCreatingProfile] = useState(false)
  const [profileCreated, setProfileCreated] = useState(false)

  useEffect(() => {
    async function loadUser() {
      try {
        // Vérifier si l'utilisateur est connecté
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          console.log("Utilisateur non connecté, redirection vers login")
          router.push("/auth/login?redirectTo=/dashboard")
          return
        }
        
        console.log("Utilisateur connecté:", user.id)
        
        // Récupérer le profil de l'utilisateur
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        
        if (profileError && profileError.code !== 'PGRST116') {
          console.error("Erreur lors de la récupération du profil:", profileError)
        }
        
        // Mettre à jour l'état avec les informations de l'utilisateur et son profil
        setUser({ ...user, profile: profileData || null })
      } catch (error) {
        console.error("Erreur lors du chargement de l'utilisateur:", error)
      } finally {
        setLoading(false)
      }
    }
    
    loadUser()
  }, [])

  // Fonction pour créer ou mettre à jour le profil de l'utilisateur
  const createOrUpdateProfile = async () => {
    if (!user?.id) return;
    
    setCreatingProfile(true);
    try {
      console.log("Tentative de création manuelle du profil pour:", user.id);
      
      // Créer ou mettre à jour le profil
      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          first_name: user.user_metadata?.first_name || 'Utilisateur',
          last_name: user.user_metadata?.last_name || 'Ensemble',
          email: user.email,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' })
        .select()
      
      if (error) {
        console.error("Erreur lors de la création du profil:", error);
        console.error("Code d'erreur:", error.code);
        console.error("Message d'erreur:", error.message);
        console.error("Détails:", error.details);
      } else {
        console.log("Profil créé ou mis à jour avec succès:", data);
        setUser((prev: any) => ({ 
          ...prev, 
          profile: { 
            first_name: user.user_metadata?.first_name || 'Utilisateur', 
            last_name: user.user_metadata?.last_name || 'Ensemble' 
          } 
        }));
        setProfileCreated(true);
      }
    } catch (err) {
      console.error("Exception lors de la création du profil:", err);
    } finally {
      setCreatingProfile(false);
    }
  }

  if (loading) {
    return (
      <div className="container flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-4xl">
          <CardHeader className="text-center">
            <CardTitle>Ensemble Calendar</CardTitle>
            <CardDescription>Chargement de votre calendrier...</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Tableau de bord</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Bienvenue, {user?.profile?.first_name || user?.user_metadata?.first_name || 'Utilisateur'}</CardTitle>
            <CardDescription>Voici votre tableau de bord personnel</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Connecté avec {user?.email}</p>
            
            {!user?.profile && !profileCreated && (
              <div className="mt-4">
                <p className="text-sm text-amber-600 mb-2">Votre profil n'a pas été trouvé dans la base de données.</p>
                <Button 
                  onClick={createOrUpdateProfile} 
                  disabled={creatingProfile}
                  variant="outline" 
                  size="sm"
                  className="w-full"
                >
                  {creatingProfile ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Création en cours...
                    </>
                  ) : (
                    "Créer mon profil"
                  )}
                </Button>
              </div>
            )}
            
            {profileCreated && (
              <p className="text-sm text-green-600 mt-2">
                Profil créé avec succès ! Rafraîchissez la page pour voir les changements.
              </p>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Calendrier</CardTitle>
            <CardDescription>Sélectionnez une date</CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border"
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Actions rapides</CardTitle>
            <CardDescription>Gérez votre famille et vos événements</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full" variant="outline">
              <CalendarIcon className="mr-2 h-4 w-4" />
              Ajouter un événement
            </Button>
            <Button className="w-full" variant="outline">
              <Users className="mr-2 h-4 w-4" />
              Gérer la famille
            </Button>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Événements à venir</CardTitle>
          <CardDescription>Vos prochains rendez-vous et activités</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center py-8 text-muted-foreground">
            Aucun événement à venir. Commencez par ajouter des événements à votre calendrier.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
