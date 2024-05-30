import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.SUPABASE_PROJECT_URL as string
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string

export const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)
