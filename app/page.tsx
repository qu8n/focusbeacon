"use client"

import { HomeContent } from "@/app/home/content"
import { useGetSigninStatus } from "@/hooks/use-get-signin-status"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function Home() {
  const { isSuccess } = useGetSigninStatus()
  const router = useRouter()
  useEffect(() => {
    if (isSuccess) {
      router.push("/dashboard")
    }
  }, [isSuccess, router])

  return <HomeContent />
}
