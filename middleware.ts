import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { supabaseClient } from "@/lib/supabase"

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === "/") {
    const sessionId = request.cookies.get("sessionId")?.value
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
