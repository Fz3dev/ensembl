import { createBrowserClient } from "@supabase/ssr"
import type { User } from "@supabase/supabase-js"

// Création du client Supabase avec une meilleure gestion des erreurs
let supabaseClient: ReturnType<typeof createBrowserClient> | null = null

export function getSupabaseClient() {
  if (typeof window === "undefined") {
    // Ne pas initialiser le client côté serveur
    return null
  }

  if (!supabaseClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("Erreur: Variables d'environnement Supabase manquantes")
      throw new Error("Variables d'environnement Supabase manquantes")
    }

    try {
      supabaseClient = createBrowserClient(supabaseUrl, supabaseAnonKey)
    } catch (error) {
      console.error("Erreur lors de la création du client Supabase:", error)
      throw new Error("Échec de l'initialisation du client Supabase")
    }
  }

  return supabaseClient
}

// Création d'un client sécurisé qui ne lance pas d'erreur
export const supabase = {
  auth: {
    getSession: async () => {
      try {
        const client = getSupabaseClient()
        if (!client) return { data: { session: null }, error: null }
        return await client.auth.getSession()
      } catch (error) {
        console.error("Erreur lors de la récupération de la session:", error)
        return { data: { session: null }, error }
      }
    },
    getUser: async () => {
      try {
        const client = getSupabaseClient()
        if (!client) return { data: { user: null }, error: null }
        return await client.auth.getUser()
      } catch (error) {
        console.error("Erreur lors de la récupération de l'utilisateur:", error)
        return { data: { user: null }, error }
      }
    },
    signUp: async (params) => {
      try {
        const client = getSupabaseClient()
        if (!client) return { data: null, error: { message: "Client Supabase non disponible" } }
        return await client.auth.signUp(params)
      } catch (error) {
        console.error("Erreur lors de l'inscription:", error)
        return { data: null, error }
      }
    },
    signInWithPassword: async (params) => {
      try {
        const client = getSupabaseClient()
        if (!client) return { data: null, error: { message: "Client Supabase non disponible" } }
        return await client.auth.signInWithPassword(params)
      } catch (error) {
        console.error("Erreur lors de la connexion:", error)
        return { data: null, error }
      }
    },
    signOut: async () => {
      try {
        const client = getSupabaseClient()
        if (!client) return { error: null }
        return await client.auth.signOut()
      } catch (error) {
        console.error("Erreur lors de la déconnexion:", error)
        return { error }
      }
    },
    resetPasswordForEmail: async (email, options) => {
      try {
        const client = getSupabaseClient()
        if (!client) return { data: null, error: { message: "Client Supabase non disponible" } }
        return await client.auth.resetPasswordForEmail(email, options)
      } catch (error) {
        console.error("Erreur lors de la réinitialisation du mot de passe:", error)
        return { data: null, error }
      }
    },
    updateUser: async (params) => {
      try {
        const client = getSupabaseClient()
        if (!client) return { data: null, error: { message: "Client Supabase non disponible" } }
        return await client.auth.updateUser(params)
      } catch (error) {
        console.error("Erreur lors de la mise à jour de l'utilisateur:", error)
        return { data: null, error }
      }
    },
    exchangeCodeForSession: async (code) => {
      try {
        const client = getSupabaseClient()
        if (!client) return { data: null, error: { message: "Client Supabase non disponible" } }
        return await client.auth.exchangeCodeForSession(code)
      } catch (error) {
        console.error("Erreur lors de l'échange de code:", error)
        return { data: null, error }
      }
    },
  },
  from: (table) => {
    try {
      const client = getSupabaseClient()
      if (!client) throw new Error("Client Supabase non disponible")
      return client.from(table)
    } catch (error) {
      console.error(`Erreur lors de l'accès à la table ${table}:`, error)
      // Retourner un objet factice qui ne lance pas d'erreur
      return {
        select: () => Promise.resolve({ data: null, error }),
        insert: () => Promise.resolve({ data: null, error }),
        update: () => Promise.resolve({ data: null, error }),
        delete: () => Promise.resolve({ data: null, error }),
        eq: () => ({ data: null, error }),
        order: () => ({ data: null, error }),
      }
    }
  },
  rpc: (fn, params) => {
    try {
      const client = getSupabaseClient()
      if (!client) throw new Error("Client Supabase non disponible")
      return client.rpc(fn, params)
    } catch (error) {
      console.error(`Erreur lors de l'appel RPC ${fn}:`, error)
      return Promise.resolve({ data: null, error })
    }
  },
}

// Le reste du fichier reste inchangé...
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

// Le reste des fonctions reste inchangé...

