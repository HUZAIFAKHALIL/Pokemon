import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      teams: {
        Row: {
          id: string
          name: string
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          user_id?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      pokemon: {
        Row: {
          id: number
          name: string
          image: string | null
          types: string[]
          base_experience: number
        }
        Insert: {
          id: number
          name: string
          image?: string | null
          types: string[]
          base_experience?: number
        }
        Update: {
          id?: number
          name?: string
          image?: string | null
          types?: string[]
          base_experience?: number
        }
      }
      team_pokemon: {
        Row: {
          id: string
          team_id: string
          pokemon_id: number
          position: number
          added_at: string
        }
        Insert: {
          id?: string
          team_id: string
          pokemon_id: number
          position?: number
          added_at?: string
        }
        Update: {
          id?: string
          team_id?: string
          pokemon_id?: number
          position?: number
          added_at?: string
        }
      }
    }
  }
}
