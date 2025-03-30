"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Loader2, UserPlus } from "lucide-react"
import { supabase } from "@/utils/supabase/client"
import { useToast } from "@/components/ui/use-toast"

interface FamilyMembersListProps {
  familyId: string
}

export default function FamilyMembersList({ familyId }: FamilyMembersListProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [adults, setAdults] = useState<any[]>([])
  const [children, setChildren] = useState<any[]>([])

  useEffect(() => {
    if (!familyId) return
    
    async function loadFamilyMembers() {
      setLoading(true)
      try {
        // 1. Charger les membres adultes (utilisateurs)
        const { data: adultMembers, error: adultsError } = await supabase
          .from("family_members")
          .select(`
            id,
            role,
            user_id,
            profiles:user_id(id, first_name, last_name, email, avatar_url)
          `)
          .eq("family_id", familyId)
        
        if (adultsError) {
          throw new Error(`Erreur lors du chargement des membres adultes: ${adultsError.message}`)
        }
        
        // 2. Charger les enfants
        const { data: childrenData, error: childrenError } = await supabase
          .from("children")
          .select("*")
          .eq("family_id", familyId)
        
        if (childrenError) {
          throw new Error(`Erreur lors du chargement des enfants: ${childrenError.message}`)
        }
        
        setAdults(adultMembers || [])
        setChildren(childrenData || [])
        
      } catch (error: any) {
        console.error("Erreur lors du chargement des membres:", error)
        toast({
          title: "Erreur",
          description: "Impossible de charger les membres de la famille",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    loadFamilyMembers()
  }, [familyId, toast])

  const getInitials = (firstName: string, lastName?: string) => {
    const firstInitial = firstName.charAt(0).toUpperCase()
    const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : ""
    return `${firstInitial}${lastInitial}`
  }

  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium mb-2">Parents</h3>
        <div className="space-y-2">
          {adults.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucun parent</p>
          ) : (
            adults.map((member) => (
              <div key={member.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={member.profiles?.avatar_url || ""} />
                    <AvatarFallback>
                      {getInitials(
                        member.profiles?.first_name || "U", 
                        member.profiles?.last_name
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">
                      {member.profiles?.first_name} {member.profiles?.last_name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {member.role === "admin" ? "Administrateur" : "Membre"}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
          
          <Button variant="outline" size="sm" className="w-full mt-2">
            <UserPlus className="h-4 w-4 mr-2" />
            Inviter un parent
          </Button>
        </div>
      </div>
      
      <div>
        <h3 className="text-sm font-medium mb-2">Enfants</h3>
        <div className="space-y-2">
          {children.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucun enfant</p>
          ) : (
            children.map((child) => (
              <div key={child.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback style={{ backgroundColor: child.color }}>
                      {child.first_name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{child.first_name}</p>
                  </div>
                </div>
              </div>
            ))
          )}
          
          <Button variant="outline" size="sm" className="w-full mt-2">
            <UserPlus className="h-4 w-4 mr-2" />
            Ajouter un enfant
          </Button>
        </div>
      </div>
    </div>
  )
}
