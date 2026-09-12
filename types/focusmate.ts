/**
 * From Focusmate Profile API
 * https://apidocs.focusmate.com/#8f4fe5e5-0774-46ce-8010-5ed082c4f581
 */
export interface FmProfile {
  user: FmUser
}
export interface FmUser {
  userId: string
  name: string
  totalSessionCount: number
  timeZone: string
  photoUrl: string
  memberSince: string
}

/**
 * From Focusmate Sessions API
 * https://apidocs.focusmate.com/#6e343d29-8cbc-4420-b44f-0e6b9ac13547
 */
export interface FmSessions {
  sessions: FmSession[]
}
export interface FmSession {
  sessionId: string
  sessionType: "paired" | "group"
  duration: number
  startTime: string
  // May be null. Replaces the deprecated users[0].sessionTitle, which is
  // always null for group sessions
  title: string | null
  // The calling user is always first. For a group session the rest are the
  // host, then the other participants; for a paired session there is at most
  // one other user, and none at all when the session was never matched
  users: FmSessionUser[]
}
export interface FmSessionUser {
  userId: string
  // "host" or "participant" for group sessions, null for paired ones
  role: "host" | "participant" | null
  requestedAt?: string
  joinedAt?: string | null
  completed?: boolean
  /** @deprecated Use the session-level `title` instead */
  sessionTitle?: string | null
  // Paired only, null for group sessions
  activityType?: "anything" | "desk" | "moving" | null
  isFavorite?: boolean
}
