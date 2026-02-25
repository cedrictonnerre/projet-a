import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

// Client Supabase côté serveur uniquement (Server Actions)
// Utilise SUPABASE_SERVICE_ROLE_KEY — ne jamais exposer côté client
export function createServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      'Variables d\'environnement Supabase manquantes : NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont requises.'
    )
  }

  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}
