"use server"

import { supabaseClient } from "@/lib/supabase"
import { cookies } from "next/headers"
import { revalidateTag } from "next/cache"

export async function updateGoal(goal: number) {
  const sessionId = cookies().get("sessionId")!.value

  const { error } = await supabaseClient
    .from("profile")
    .update({ weekly_goal: goal })
    .eq("session_id", sessionId)

  if (error) {
    throw new Error(`Failed to update goal: ${error.message}`)
  }

  revalidateTag("goal")
}
