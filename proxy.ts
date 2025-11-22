import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { supabaseClient } from "@/lib/supabase"
import { SESSION_COOKIE_NAME } from "@/lib/config"

export async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === "/") {
    const sessionId = request.cookies.get(SESSION_COOKIE_NAME)?.value
    if (!sessionId) {
      return NextResponse.redirect(new URL("/home", request.url))
    }
    const { data: user } = await supabaseClient
      .from("profile")
      .select("*")
      .eq("session_id", sessionId)
      .single()
    if (!user) {
      return NextResponse.redirect(new URL("/home", request.url))
    }
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }
}
