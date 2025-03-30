import { createBrowserClient } from '@supabase/ssr'
import type { User } from '@supabase/supabase-js'

// Création du client Supabase avec le nouveau package SSR
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Types et fonctions d'authentification

export type Event = {
  id: string
  label: string
  color: string
  dates: string[] // Array of ISO date strings
  start_time?: string | null // Heure de début optionnelle (format HH:MM)
  end_time?: string | null // Heure de fin optionnelle (format HH:MM)
  is_persistent: boolean // Indique si l'événement est persistant
  assigned_to?: string | null // UUID of the person (adult or child) assigned to this event
  family_id?: string | null // UUID of the family this event belongs to
}

export type EventTemplate = {
  id: string
  name: string
  color: string
  start_time?: string | null
  end_time?: string | null
}

export type EventType = {
  id: string
  name: string
  color: string
  start_time?: string | null
  end_time?: string | null
}

export type Family = {
  id: string
  name: string
  created_at: string
  updated_at: string
}

export type FamilyMember = {
  id: string
  family_id: string
  user_id: string
  role: "admin" | "member"
  created_at: string
  updated_at: string
  // Join with profiles
  email?: string
  first_name?: string
  last_name?: string
}

export type Child = {
  id: string
  family_id: string
  first_name: string
  color: string
  created_at: string
  updated_at: string
}

export type InvitationCode = {
  code: string
  family_id: string
  created_by: string
  expires_at: string
  created_at: string
}

export type FamilyWithRole = {
  id: string
  name: string
  role: "admin" | "member"
}

export type Profile = {
  id: string
  first_name: string
  last_name: string
  email: string
  avatar_url?: string | null
  preferences?: Record<string, any> | null
  created_at: string
  updated_at: string
}

// Authentication functions
export async function signUp(email: string, password: string, firstName: string, lastName: string) {
  return await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
      },
    },
  })
}

export async function signIn(email: string, password: string) {
  return await supabase.auth.signInWithPassword({
    email,
    password,
  })
}

export async function signOut() {
  return await supabase.auth.signOut()
}

// Improved getCurrentUser function with better error handling
export async function getCurrentUser(): Promise<User | null> {
  try {
    // First check if we have a session
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

    if (sessionError) {
      console.error("Error getting session:", sessionError)
      return null
    }

    // If no session, return null
    if (!sessionData?.session) {
      return null
    }

    // If we have a session, get the user
    const { data, error } = await supabase.auth.getUser()

    if (error) {
      console.error("Error getting user:", error)
      return null
    }

    return data?.user || null
  } catch (e) {
    console.error("Exception in getCurrentUser:", e)
    return null
  }
}
