// Ce fichier est normalement auto-généré par :
// supabase gen types typescript --project-id <id> > src/types/database.ts
// Il est ici créé manuellement sur la base du schéma 001_init_schema.sql
// À régénérer après chaque migration avec la commande ci-dessus.

export type Database = {
  public: {
    Tables: {
      profil: {
        Row: {
          id: string
          poids: number
          taille: number
          age: number
          sexe: 'homme' | 'femme'
          niveau_activite: 'sedentaire' | 'leger' | 'modere' | 'tres_actif' | 'extreme'
          objectif: 'perte_poids' | 'maintien' | 'prise_muscle'
          objectif_kcal: number
          allergies: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          poids: number
          taille: number
          age: number
          sexe: 'homme' | 'femme'
          niveau_activite?: 'sedentaire' | 'leger' | 'modere' | 'tres_actif' | 'extreme'
          objectif?: 'perte_poids' | 'maintien' | 'prise_muscle'
          objectif_kcal: number
          allergies?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          poids?: number
          taille?: number
          age?: number
          sexe?: 'homme' | 'femme'
          niveau_activite?: 'sedentaire' | 'leger' | 'modere' | 'tres_actif' | 'extreme'
          objectif?: 'perte_poids' | 'maintien' | 'prise_muscle'
          objectif_kcal?: number
          allergies?: string[]
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      recettes: {
        Row: {
          id: string
          nom_recette: string
          type_repas: 'matin' | 'midi' | 'soir' | 'collation'
          ingredients: { nom: string; grammes: number; rayon_drive: string }[]
          calories_100g: number
          temps_prepa: number
          is_recyclable: boolean
        }
        Insert: {
          id?: string
          nom_recette: string
          type_repas: 'matin' | 'midi' | 'soir' | 'collation'
          ingredients: { nom: string; grammes: number; rayon_drive: string }[]
          calories_100g: number
          temps_prepa: number
          is_recyclable?: boolean
        }
        Update: {
          id?: string
          nom_recette?: string
          type_repas?: 'matin' | 'midi' | 'soir' | 'collation'
          ingredients?: { nom: string; grammes: number; rayon_drive: string }[]
          calories_100g?: number
          temps_prepa?: number
          is_recyclable?: boolean
        }
        Relationships: []
      }
      suivi_sportif: {
        Row: {
          id: string
          type_sport: 'musculation' | 'trail' | 'running' | 'etirements'
          duree: number
          kcal_brulees: number
          impact_macro: 'glucides' | 'proteines'
          created_at: string
        }
        Insert: {
          id?: string
          type_sport: 'musculation' | 'trail' | 'running' | 'etirements'
          duree: number
          kcal_brulees: number
          impact_macro: 'glucides' | 'proteines'
          created_at?: string
        }
        Update: {
          id?: string
          type_sport?: 'musculation' | 'trail' | 'running' | 'etirements'
          duree?: number
          kcal_brulees?: number
          impact_macro?: 'glucides' | 'proteines'
          created_at?: string
        }
        Relationships: []
      }
      planificateur_hebdo: {
        Row: {
          id: string
          date: string
          repas_id: string | null
          sport_id: string | null
          is_rest: boolean
          created_at: string
        }
        Insert: {
          id?: string
          date: string
          repas_id?: string | null
          sport_id?: string | null
          is_rest?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          date?: string
          repas_id?: string | null
          sport_id?: string | null
          is_rest?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'planificateur_hebdo_repas_id_fkey'
            columns: ['repas_id']
            isOneToOne: false
            referencedRelation: 'recettes'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'planificateur_hebdo_sport_id_fkey'
            columns: ['sport_id']
            isOneToOne: false
            referencedRelation: 'suivi_sportif'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: { [_ in never]: never }
    Functions: { [_ in never]: never }
    Enums: { [_ in never]: never }
    CompositeTypes: { [_ in never]: never }
  }
}

// Alias pratiques
export type Profil = Database['public']['Tables']['profil']['Row']
export type ProfilInsert = Database['public']['Tables']['profil']['Insert']
export type ProfilUpdate = Database['public']['Tables']['profil']['Update']
