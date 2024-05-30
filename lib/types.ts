/**
 * From Focusmate Profile API
 * https://apidocs.focusmate.com/#8f4fe5e5-0774-46ce-8010-5ed082c4f581
 */
export interface FocusmateProfile {
  user: FocusmateUser
}

export interface FocusmateUser {
  userId: string
  name: string
  totalSessionCount: number
  timeZone: string
  photoUrl: string
  memberSince: string
}

// Supabase `profile` table schema
export interface DbUser
  extends Pick<
    FocusmateUser,
    "userId" | "totalSessionCount" | "timeZone" | "memberSince"
  > {
  accessTokenEncrypted: string
  sessionId: string
}
