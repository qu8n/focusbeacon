import { SupabaseClient, createClient } from "@supabase/supabase-js"
import { Database } from "@/types/supabase"
import { SUPABASE_PROJECT_URL, SUPABASE_SERVICE_ROLE_KEY } from "@/lib/config"

export const supabaseClient: SupabaseClient<Database> = createClient(
  SUPABASE_PROJECT_URL,
  SUPABASE_SERVICE_ROLE_KEY
)
