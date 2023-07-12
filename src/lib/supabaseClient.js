import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client to access database with service key, which is
// stored in an environment variable. The "user" data table has Row Level
// Security (RLS) enabled with no policies, preventing unauthorized access
// to the table.

let supabase;
if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY) {
  supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );
}

export { supabase };