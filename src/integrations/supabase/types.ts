export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      market_data: {
        Row: {
          id: string
          market_cap: number | null
          price_change_24h: number | null
          price_usd: number
          token_address: string | null
          token_symbol: string
          updated_at: string
          volume_24h: number | null
        }
        Insert: {
          id?: string
          market_cap?: number | null
          price_change_24h?: number | null
          price_usd: number
          token_address?: string | null
          token_symbol: string
          updated_at?: string
          volume_24h?: number | null
        }
        Update: {
          id?: string
          market_cap?: number | null
          price_change_24h?: number | null
          price_usd?: number
          token_address?: string | null
          token_symbol?: string
          updated_at?: string
          volume_24h?: number | null
        }
        Relationships: []
      }
      positions: {
        Row: {
          amount: number
          avg_entry_price: number | null
          created_at: string
          current_value_usd: number | null
          id: string
          pnl_percentage: number | null
          pnl_usd: number | null
          token_address: string
          token_symbol: string
          updated_at: string
          wallet_id: string
        }
        Insert: {
          amount?: number
          avg_entry_price?: number | null
          created_at?: string
          current_value_usd?: number | null
          id?: string
          pnl_percentage?: number | null
          pnl_usd?: number | null
          token_address: string
          token_symbol: string
          updated_at?: string
          wallet_id: string
        }
        Update: {
          amount?: number
          avg_entry_price?: number | null
          created_at?: string
          current_value_usd?: number | null
          id?: string
          pnl_percentage?: number | null
          pnl_usd?: number | null
          token_address?: string
          token_symbol?: string
          updated_at?: string
          wallet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "positions_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          created_at: string
          executed_at: string | null
          from_amount: number | null
          from_token: string | null
          gas_price_gwei: number | null
          gas_used: number | null
          id: string
          status: Database["public"]["Enums"]["transaction_status"]
          to_amount: number | null
          to_token: string | null
          tx_hash: string | null
          type: Database["public"]["Enums"]["transaction_type"]
          wallet_id: string
        }
        Insert: {
          created_at?: string
          executed_at?: string | null
          from_amount?: number | null
          from_token?: string | null
          gas_price_gwei?: number | null
          gas_used?: number | null
          id?: string
          status?: Database["public"]["Enums"]["transaction_status"]
          to_amount?: number | null
          to_token?: string | null
          tx_hash?: string | null
          type: Database["public"]["Enums"]["transaction_type"]
          wallet_id: string
        }
        Update: {
          created_at?: string
          executed_at?: string | null
          from_amount?: number | null
          from_token?: string | null
          gas_price_gwei?: number | null
          gas_used?: number | null
          id?: string
          status?: Database["public"]["Enums"]["transaction_status"]
          to_amount?: number | null
          to_token?: string | null
          tx_hash?: string | null
          type?: Database["public"]["Enums"]["transaction_type"]
          wallet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      wallets: {
        Row: {
          address: string
          chain_id: number
          connected_at: string
          id: string
          is_primary: boolean
          last_active_at: string
          user_id: string | null
        }
        Insert: {
          address: string
          chain_id?: number
          connected_at?: string
          id?: string
          is_primary?: boolean
          last_active_at?: string
          user_id?: string | null
        }
        Update: {
          address?: string
          chain_id?: number
          connected_at?: string
          id?: string
          is_primary?: boolean
          last_active_at?: string
          user_id?: string | null
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
      transaction_status: "pending" | "completed" | "failed" | "cancelled"
      transaction_type: "swap" | "deposit" | "withdraw" | "trade"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      transaction_status: ["pending", "completed", "failed", "cancelled"],
      transaction_type: ["swap", "deposit", "withdraw", "trade"],
    },
  },
} as const
