export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profile: {
        Row: {
          access_token_encrypted: string | null
          created_at: string
          weekend_breaks_daily_streak: boolean
          late_after_seconds: number
          member_since: string | null
          session_id: string | null
          time_zone: string
          total_session_count: number | null
          user_id: string
        }
        Insert: {
          access_token_encrypted?: string | null
          created_at?: string
          weekend_breaks_daily_streak?: boolean
          late_after_seconds?: number
          member_since?: string | null
          session_id?: string | null
          time_zone: string
          total_session_count?: number | null
          user_id: string
        }
        Update: {
          access_token_encrypted?: string | null
          created_at?: string
          weekend_breaks_daily_streak?: boolean
          late_after_seconds?: number
          member_since?: string | null
          session_id?: string | null
          time_zone?: string
          total_session_count?: number | null
          user_id?: string
        }
        Relationships: []
      }
      sessions: {
        Row: {
          completed: boolean
          created_at: string
          duration: number
          joined_at_utc: string | null
          partner_id: string | null
          requested_at_utc: string
          session_id: string
          session_title: string | null
          start_time_utc: string
          user_id: string | null
        }
        Insert: {
          completed: boolean
          created_at?: string
          duration: number
          joined_at_utc?: string | null
          partner_id?: string | null
          requested_at_utc: string
          session_id: string
          session_title?: string | null
          start_time_utc: string
          user_id?: string | null
        }
        Update: {
          completed?: boolean
          created_at?: string
          duration?: number
          joined_at_utc?: string | null
          partner_id?: string | null
          requested_at_utc?: string
          session_id?: string
          session_title?: string | null
          start_time_utc?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profile"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user: {
        Row: {
          created_at: string
          time_zone: string
          user_id: string
        }
        Insert: {
          created_at?: string
          time_zone: string
          user_id: string
        }
        Update: {
          created_at?: string
          time_zone?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never
