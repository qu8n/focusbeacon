import { type NextRequest } from "next/server"
import { supabaseClient } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  const sessionId = request.cookies.get("sessionId")?.value

  if (!sessionId) {
    return new Response("No session ID", {
      status: 400,
    })
  }

  const { data: user } = await supabaseClient
    .from("profile")
    .select("*")
    .eq("session_id", sessionId)
    .single()

  if (!user) {
    return new Response("No user found in database", {
      status: 400,
    })
  }

  return new Response("User has a valid session ID", {
    status: 200,
  })
}
