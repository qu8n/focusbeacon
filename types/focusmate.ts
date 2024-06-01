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
  duration: number
  startTime: string
  // If the session is incomplete, aka users[0].completed === false,
  // then users[1] will be undefined and users[0].joinedAt might be null
  users: FmSessionUser[]
}
export interface FmSessionUser {
  userId: string
  requestedAt?: string
  joinedAt?: string | null
  completed?: boolean
  sessionTitle?: string | null
}
