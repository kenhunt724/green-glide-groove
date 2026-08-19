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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      capacity_settings: {
        Row: {
          build_bays: number
          created_at: string
          generator_builds_per_week: number
          id: string
          service_visits_per_week: number
          technician_count: number
          technician_days_per_week: number
          updated_at: string
          vault_installs_per_week: number
        }
        Insert: {
          build_bays?: number
          created_at?: string
          generator_builds_per_week?: number
          id?: string
          service_visits_per_week?: number
          technician_count?: number
          technician_days_per_week?: number
          updated_at?: string
          vault_installs_per_week?: number
        }
        Update: {
          build_bays?: number
          created_at?: string
          generator_builds_per_week?: number
          id?: string
          service_visits_per_week?: number
          technician_count?: number
          technician_days_per_week?: number
          updated_at?: string
          vault_installs_per_week?: number
        }
        Relationships: []
      }
      consultation_slots: {
        Row: {
          created_at: string
          duration_minutes: number
          id: string
          is_booked: boolean
          lead_id: string | null
          slot_at: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          duration_minutes?: number
          id?: string
          is_booked?: boolean
          lead_id?: string | null
          slot_at: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          duration_minutes?: number
          id?: string
          is_booked?: boolean
          lead_id?: string | null
          slot_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "consultation_slots_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "energy_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      energy_leads: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          monthly_bill_range: string
          notes: string | null
          outcome: string
          outcome_at: string | null
          phone: string
          preferred_time: string
          property_type: string
          roof_condition: string | null
          score: number | null
          scored_at: string | null
          slot_id: string | null
          solution_interest: string | null
          vehicle_type: string | null
          zip_code: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id?: string
          monthly_bill_range: string
          notes?: string | null
          outcome?: string
          outcome_at?: string | null
          phone: string
          preferred_time: string
          property_type: string
          roof_condition?: string | null
          score?: number | null
          scored_at?: string | null
          slot_id?: string | null
          solution_interest?: string | null
          vehicle_type?: string | null
          zip_code: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          monthly_bill_range?: string
          notes?: string | null
          outcome?: string
          outcome_at?: string | null
          phone?: string
          preferred_time?: string
          property_type?: string
          roof_condition?: string | null
          score?: number | null
          scored_at?: string | null
          slot_id?: string | null
          solution_interest?: string | null
          vehicle_type?: string | null
          zip_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "energy_leads_slot_id_fkey"
            columns: ["slot_id"]
            isOneToOne: false
            referencedRelation: "consultation_slots"
            referencedColumns: ["id"]
          },
        ]
      }
      job_profiles: {
        Row: {
          build_hours: number
          created_at: string
          id: string
          parts_lead_time_days: number
          solution_interest: string
          technician_days: number
          unit_kind: string
          updated_at: string
        }
        Insert: {
          build_hours?: number
          created_at?: string
          id?: string
          parts_lead_time_days?: number
          solution_interest: string
          technician_days?: number
          unit_kind?: string
          updated_at?: string
        }
        Update: {
          build_hours?: number
          created_at?: string
          id?: string
          parts_lead_time_days?: number
          solution_interest?: string
          technician_days?: number
          unit_kind?: string
          updated_at?: string
        }
        Relationships: []
      }
      producer_orders: {
        Row: {
          buyer_email: string
          buyer_name: string | null
          checkout_reference: string | null
          created_at: string
          id: string
          items: Json
          platform_fee_cents: number
          producer_id: string
          producer_payout_cents: number
          status: string
          total_cents: number
        }
        Insert: {
          buyer_email: string
          buyer_name?: string | null
          checkout_reference?: string | null
          created_at?: string
          id?: string
          items?: Json
          platform_fee_cents?: number
          producer_id: string
          producer_payout_cents?: number
          status?: string
          total_cents: number
        }
        Update: {
          buyer_email?: string
          buyer_name?: string | null
          checkout_reference?: string | null
          created_at?: string
          id?: string
          items?: Json
          platform_fee_cents?: number
          producer_id?: string
          producer_payout_cents?: number
          status?: string
          total_cents?: number
        }
        Relationships: [
          {
            foreignKeyName: "producer_orders_producer_id_fkey"
            columns: ["producer_id"]
            isOneToOne: false
            referencedRelation: "producers"
            referencedColumns: ["id"]
          },
        ]
      }
      producer_products: {
        Row: {
          artwork_url: string | null
          bpm: number | null
          created_at: string
          description: string
          id: string
          kind: string
          license_terms: string
          preview_url: string | null
          price_cents: number
          producer_id: string
          published: boolean
          song_key: string | null
          sort_order: number
          title: string
        }
        Insert: {
          artwork_url?: string | null
          bpm?: number | null
          created_at?: string
          description?: string
          id?: string
          kind?: string
          license_terms?: string
          preview_url?: string | null
          price_cents: number
          producer_id: string
          published?: boolean
          song_key?: string | null
          sort_order?: number
          title: string
        }
        Update: {
          artwork_url?: string | null
          bpm?: number | null
          created_at?: string
          description?: string
          id?: string
          kind?: string
          license_terms?: string
          preview_url?: string | null
          price_cents?: number
          producer_id?: string
          published?: boolean
          song_key?: string | null
          sort_order?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "producer_products_producer_id_fkey"
            columns: ["producer_id"]
            isOneToOne: false
            referencedRelation: "producers"
            referencedColumns: ["id"]
          },
        ]
      }
      producers: {
        Row: {
          accent: string
          bio: string
          city: string
          created_at: string
          display_name: string
          id: string
          platform_share_bps: number
          published: boolean
          slug: string
          tagline: string
          updated_at: string
        }
        Insert: {
          accent?: string
          bio?: string
          city?: string
          created_at?: string
          display_name: string
          id?: string
          platform_share_bps?: number
          published?: boolean
          slug: string
          tagline?: string
          updated_at?: string
        }
        Update: {
          accent?: string
          bio?: string
          city?: string
          created_at?: string
          display_name?: string
          id?: string
          platform_share_bps?: number
          published?: boolean
          slug?: string
          tagline?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "staff" | "user"
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
      app_role: ["admin", "staff", "user"],
    },
  },
} as const
