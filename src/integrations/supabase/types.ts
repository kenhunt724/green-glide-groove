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
    PostgrestVersion: "14.5"
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
      community_signups: {
        Row: {
          availability: string | null
          capabilities: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          kind: string
          neighborhood: string
          notes: string | null
          phone: string
          shop_name: string | null
          status: string
          trade_interest: string | null
          updated_at: string
        }
        Insert: {
          availability?: string | null
          capabilities?: string | null
          created_at?: string
          email: string
          full_name: string
          id?: string
          kind?: string
          neighborhood: string
          notes?: string | null
          phone: string
          shop_name?: string | null
          status?: string
          trade_interest?: string | null
          updated_at?: string
        }
        Update: {
          availability?: string | null
          capabilities?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          kind?: string
          neighborhood?: string
          notes?: string | null
          phone?: string
          shop_name?: string | null
          status?: string
          trade_interest?: string | null
          updated_at?: string
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
      creator_invites: {
        Row: {
          code: string
          created_at: string
          created_by: string | null
          expires_at: string | null
          id: string
          invited_email: string | null
          invited_name: string | null
          max_uses: number
          note: string | null
          revoked: boolean
          used_count: number
        }
        Insert: {
          code: string
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          invited_email?: string | null
          invited_name?: string | null
          max_uses?: number
          note?: string | null
          revoked?: boolean
          used_count?: number
        }
        Update: {
          code?: string
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          invited_email?: string | null
          invited_name?: string | null
          max_uses?: number
          note?: string | null
          revoked?: boolean
          used_count?: number
        }
        Relationships: []
      }
      creator_items: {
        Row: {
          ai_bpm: number | null
          ai_genre: string | null
          ai_instruments: string[]
          ai_key: string | null
          ai_mood: string | null
          ai_summary: string | null
          ai_tagged_at: string | null
          ai_tags: string[]
          artwork_path: string | null
          created_at: string
          description: string
          duration_seconds: number | null
          id: string
          kind: string
          license_terms: string
          master_bytes: number | null
          master_format: string | null
          master_path: string | null
          owner_user_id: string
          page_id: string
          preview_path: string | null
          price_cents: number | null
          published: boolean
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          ai_bpm?: number | null
          ai_genre?: string | null
          ai_instruments?: string[]
          ai_key?: string | null
          ai_mood?: string | null
          ai_summary?: string | null
          ai_tagged_at?: string | null
          ai_tags?: string[]
          artwork_path?: string | null
          created_at?: string
          description?: string
          duration_seconds?: number | null
          id?: string
          kind?: string
          license_terms?: string
          master_bytes?: number | null
          master_format?: string | null
          master_path?: string | null
          owner_user_id: string
          page_id: string
          preview_path?: string | null
          price_cents?: number | null
          published?: boolean
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          ai_bpm?: number | null
          ai_genre?: string | null
          ai_instruments?: string[]
          ai_key?: string | null
          ai_mood?: string | null
          ai_summary?: string | null
          ai_tagged_at?: string | null
          ai_tags?: string[]
          artwork_path?: string | null
          created_at?: string
          description?: string
          duration_seconds?: number | null
          id?: string
          kind?: string
          license_terms?: string
          master_bytes?: number | null
          master_format?: string | null
          master_path?: string | null
          owner_user_id?: string
          page_id?: string
          preview_path?: string | null
          price_cents?: number | null
          published?: boolean
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "creator_items_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "creator_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      creator_pages: {
        Row: {
          accent: string
          bio: string
          city: string
          contact_email: string | null
          created_at: string
          display_name: string
          handle: string
          id: string
          invite_id: string | null
          links: Json
          owner_user_id: string
          platform_share_bps: number
          published: boolean
          rights_statement: string
          tagline: string
          updated_at: string
        }
        Insert: {
          accent?: string
          bio?: string
          city?: string
          contact_email?: string | null
          created_at?: string
          display_name: string
          handle: string
          id?: string
          invite_id?: string | null
          links?: Json
          owner_user_id: string
          platform_share_bps?: number
          published?: boolean
          rights_statement?: string
          tagline?: string
          updated_at?: string
        }
        Update: {
          accent?: string
          bio?: string
          city?: string
          contact_email?: string | null
          created_at?: string
          display_name?: string
          handle?: string
          id?: string
          invite_id?: string | null
          links?: Json
          owner_user_id?: string
          platform_share_bps?: number
          published?: boolean
          rights_statement?: string
          tagline?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "creator_pages_invite_id_fkey"
            columns: ["invite_id"]
            isOneToOne: false
            referencedRelation: "creator_invites"
            referencedColumns: ["id"]
          },
        ]
      }
      creator_program_settings: {
        Row: {
          created_at: string
          id: string
          invite_only: boolean
          max_creator_slots: number
          max_master_bytes: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          invite_only?: boolean
          max_creator_slots?: number
          max_master_bytes?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          invite_only?: boolean
          max_creator_slots?: number
          max_master_bytes?: number
          updated_at?: string
        }
        Relationships: []
      }
      energy_leads: {
        Row: {
          created_at: string
          email: string
          entry_mode: string
          full_name: string
          id: string
          landing_path: string | null
          monthly_bill_range: string
          notes: string | null
          outcome: string
          outcome_at: string | null
          phone: string
          preferred_time: string
          property_type: string
          referrer_host: string | null
          roof_condition: string | null
          score: number | null
          scored_at: string | null
          slot_id: string | null
          solution_interest: string | null
          source_channel: string | null
          source_detail: string | null
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
          vehicle_type: string | null
          zip_code: string
        }
        Insert: {
          created_at?: string
          email: string
          entry_mode?: string
          full_name: string
          id?: string
          landing_path?: string | null
          monthly_bill_range: string
          notes?: string | null
          outcome?: string
          outcome_at?: string | null
          phone: string
          preferred_time: string
          property_type: string
          referrer_host?: string | null
          roof_condition?: string | null
          score?: number | null
          scored_at?: string | null
          slot_id?: string | null
          solution_interest?: string | null
          source_channel?: string | null
          source_detail?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          vehicle_type?: string | null
          zip_code: string
        }
        Update: {
          created_at?: string
          email?: string
          entry_mode?: string
          full_name?: string
          id?: string
          landing_path?: string | null
          monthly_bill_range?: string
          notes?: string | null
          outcome?: string
          outcome_at?: string | null
          phone?: string
          preferred_time?: string
          property_type?: string
          referrer_host?: string | null
          roof_condition?: string | null
          score?: number | null
          scored_at?: string | null
          slot_id?: string | null
          solution_interest?: string | null
          source_channel?: string | null
          source_detail?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
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
      fleet_units: {
        Row: {
          commissioned_at: string
          created_at: string
          customer_name: string
          cycles_per_week: number
          duty_factor: number
          id: string
          module_count: number
          notes: string | null
          pack_kwh: number
          service_contract: boolean
          site_label: string | null
          status: string
          unit_code: string
          unit_kind: string
          updated_at: string
        }
        Insert: {
          commissioned_at?: string
          created_at?: string
          customer_name: string
          cycles_per_week?: number
          duty_factor?: number
          id?: string
          module_count?: number
          notes?: string | null
          pack_kwh?: number
          service_contract?: boolean
          site_label?: string | null
          status?: string
          unit_code: string
          unit_kind?: string
          updated_at?: string
        }
        Update: {
          commissioned_at?: string
          created_at?: string
          customer_name?: string
          cycles_per_week?: number
          duty_factor?: number
          id?: string
          module_count?: number
          notes?: string | null
          pack_kwh?: number
          service_contract?: boolean
          site_label?: string | null
          status?: string
          unit_code?: string
          unit_kind?: string
          updated_at?: string
        }
        Relationships: []
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
      talent_applications: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          linkedin_url: string | null
          notes: string | null
          phone: string | null
          resume_text: string | null
          role: string
          status: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id?: string
          linkedin_url?: string | null
          notes?: string | null
          phone?: string | null
          resume_text?: string | null
          role: string
          status?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          linkedin_url?: string | null
          notes?: string | null
          phone?: string | null
          resume_text?: string | null
          role?: string
          status?: string
        }
        Relationships: []
      }
      unit_telemetry: {
        Row: {
          cell_delta_mv: number | null
          created_at: string
          cycle_count: number | null
          fault_code: string | null
          id: string
          inverter_hours: number | null
          max_cell_temp_c: number | null
          pack_voltage: number | null
          recorded_at: string
          state_of_health: number | null
          unit_id: string
        }
        Insert: {
          cell_delta_mv?: number | null
          created_at?: string
          cycle_count?: number | null
          fault_code?: string | null
          id?: string
          inverter_hours?: number | null
          max_cell_temp_c?: number | null
          pack_voltage?: number | null
          recorded_at?: string
          state_of_health?: number | null
          unit_id: string
        }
        Update: {
          cell_delta_mv?: number | null
          created_at?: string
          cycle_count?: number | null
          fault_code?: string | null
          id?: string
          inverter_hours?: number | null
          max_cell_temp_c?: number | null
          pack_voltage?: number | null
          recorded_at?: string
          state_of_health?: number | null
          unit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "unit_telemetry_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "fleet_units"
            referencedColumns: ["id"]
          },
        ]
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
