import { SupabaseClient, createClient } from "@supabase/supabase-js"
import { Database } from "@/types/supabase"

const supabaseProjectUrl = process.env.SUPABASE_PROJECT_URL as string
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string

export const supabaseClient: SupabaseClient<Database> = createClient(
  supabaseProjectUrl,
  supabaseServiceRoleKey
)
