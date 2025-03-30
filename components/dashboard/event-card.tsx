"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Clock, Edit2, Trash2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"

interface EventCardProps {
  event: {
    id: string
    label: string
    color: string
    start_time?: string | null
    end_time?: string | null
    assigned_to?: string | null
    children?: { id: string; first_name: string; color: string } | null
    profiles?: { id: string; first_name: string; last_name: string } | null
  }
}

export default function EventCard({ event }: EventCardProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isDeleting, setIsDeleting] = useState(false)

  const formatTime = (time: string | null | undefined) => {
    if (!time) return ""
    return time
  }

  const getTimeDisplay = () => {
    if (event.start_time && event.end_time) {
      return `${formatTime(event.start_time)} - ${formatTime(event.end_time)}`
    } else if (event.start_time) {
      return `À partir de ${formatTime(event.start_time)}`
    } else if (event.end_time) {
      return `Jusqu'à ${formatTime(event.end_time)}`
    }
    return "Toute la journée"
  }

  const getAssignedToDisplay = () => {
    if (event.assigned_to) {
      if (event.children) {
        return event.children.first_name
      } else if (event.profiles) {
        return `${event.profiles.first_name} ${event.profiles.last_name}`
      }
    }
    return null
  }

  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase()
  }

  const handleEdit = () => {
    router.push(`/dashboard/events/edit/${event.id}`)
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const { error } = await supabase
        .from("events")
        .delete()
        .eq("id", event.id)
      
      if (error) {
        throw new Error(`Erreur lors de la suppression: ${error.message}`)
      }
      
      toast({
        title: "Événement supprimé",
        description: "L'événement a été supprimé avec succès",
      })
      
      // Rafraîchir la page pour mettre à jour la liste des événements
      router.refresh()
      
    } catch (error: any) {
      console.error("Erreur lors de la suppression de l'événement:", error)
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'événement",
        variant: "destructive"
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const assignedTo = getAssignedToDisplay()

  return (
    <Card className="overflow-hidden">
      <div className="flex">
        <div 
          className="w-2 flex-shrink-0" 
          style={{ backgroundColor: event.color }}
        />
        <CardContent className="p-4 w-full">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium">{event.label}</h3>
              <div className="flex items-center text-sm text-muted-foreground mt-1">
                <Clock className="h-3 w-3 mr-1" />
                <span>{getTimeDisplay()}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {assignedTo && (
                <Avatar className="h-6 w-6">
                  <AvatarFallback 
                    style={{ 
                      backgroundColor: event.children ? event.children.color : undefined 
                    }}
                  >
                    {getInitials(assignedTo)}
                  </AvatarFallback>
                </Avatar>
              )}
              
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleEdit}>
                <Edit2 className="h-4 w-4" />
                <span className="sr-only">Modifier</span>
              </Button>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Supprimer</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Cette action ne peut pas être annulée. Cela supprimera définitivement cet événement.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {isDeleting ? "Suppression..." : "Supprimer"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  )
}
