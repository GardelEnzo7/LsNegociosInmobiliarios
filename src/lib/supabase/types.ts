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
      admin_profiles: {
        Row: {
          active: boolean
          created_at: string
          email: string
          full_name: string
          id: string
          role: string
          user_id: string | null
        }
        Insert: {
          active?: boolean
          created_at?: string
          email: string
          full_name: string
          id?: string
          role?: string
          user_id?: string | null
        }
        Update: {
          active?: boolean
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          role?: string
          user_id?: string | null
        }
        Relationships: []
      }
      activity_log: {
        Row: {
          actor: string | null
          created_at: string
          description: string
          entity_id: string
          entity_type: string
          event_type: string
          id: string
          metadata: Json | null
        }
        Insert: {
          actor?: string | null
          created_at?: string
          description: string
          entity_id: string
          entity_type: string
          event_type: string
          id?: string
          metadata?: Json | null
        }
        Update: {
          actor?: string | null
          created_at?: string
          description?: string
          entity_id?: string
          entity_type?: string
          event_type?: string
          id?: string
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_log_actor_fkey"
            columns: ["actor"]
            isOneToOne: false
            referencedRelation: "admin_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          full_name: string
          id: string
          notes: string | null
          source: string
          updated_at: string
        }
        Insert: {
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          full_name: string
          id?: string
          notes?: string | null
          source?: string
          updated_at?: string
        }
        Update: {
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          full_name?: string
          id?: string
          notes?: string | null
          source?: string
          updated_at?: string
        }
        Relationships: []
      }
      contact_roles: {
        Row: {
          contact_id: string
          created_at: string
          role: string
        }
        Insert: {
          contact_id: string
          created_at?: string
          role: string
        }
        Update: {
          contact_id?: string
          created_at?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_roles_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_properties: {
        Row: {
          contact_id: string
          created_at: string
          property_id: string
        }
        Insert: {
          contact_id: string
          created_at?: string
          property_id: string
        }
        Update: {
          contact_id?: string
          created_at?: string
          property_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_properties_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_properties_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      visits: {
        Row: {
          assigned_to: string | null
          contact_id: string | null
          created_at: string
          id: string
          notes: string | null
          property_id: string | null
          scheduled_at: string
          status: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          contact_id?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          property_id?: string | null
          scheduled_at: string
          status?: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          contact_id?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          property_id?: string | null
          scheduled_at?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "visits_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "admin_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visits_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visits_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_internal: {
        Row: {
          assigned_to: string | null
          commission: number | null
          created_at: string
          initial_price: number | null
          internal_notes: string | null
          keys_location: string | null
          owner_contact_id: string | null
          property_id: string
          updated_at: string
          visit_instructions: string | null
        }
        Insert: {
          assigned_to?: string | null
          commission?: number | null
          created_at?: string
          initial_price?: number | null
          internal_notes?: string | null
          keys_location?: string | null
          owner_contact_id?: string | null
          property_id: string
          updated_at?: string
          visit_instructions?: string | null
        }
        Update: {
          assigned_to?: string | null
          commission?: number | null
          created_at?: string
          initial_price?: number | null
          internal_notes?: string | null
          keys_location?: string | null
          owner_contact_id?: string | null
          property_id?: string
          updated_at?: string
          visit_instructions?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "property_internal_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "admin_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_internal_owner_contact_id_fkey"
            columns: ["owner_contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_internal_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: true
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_listings: {
        Row: {
          channel: string
          created_at: string
          external_url: string | null
          id: string
          last_synced_at: string | null
          notes: string | null
          property_id: string
          status: string
        }
        Insert: {
          channel: string
          created_at?: string
          external_url?: string | null
          id?: string
          last_synced_at?: string | null
          notes?: string | null
          property_id: string
          status?: string
        }
        Update: {
          channel?: string
          created_at?: string
          external_url?: string | null
          id?: string
          last_synced_at?: string | null
          notes?: string | null
          property_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_listings_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_documents: {
        Row: {
          created_at: string
          doc_type: string
          file_path: string
          id: string
          notes: string | null
          property_id: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          doc_type: string
          file_path: string
          id?: string
          notes?: string | null
          property_id: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          doc_type?: string
          file_path?: string
          id?: string
          notes?: string | null
          property_id?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "property_documents_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "admin_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_properties: {
        Row: {
          created_at: string
          lead_id: string
          property_id: string
        }
        Insert: {
          created_at?: string
          lead_id: string
          property_id: string
        }
        Update: {
          created_at?: string
          lead_id?: string
          property_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_properties_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_properties_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          id: string
          name: string
          notes: string | null
          source: string
          status: string
        }
        Insert: {
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          name: string
          notes?: string | null
          source?: string
          status?: string
        }
        Update: {
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          name?: string
          notes?: string | null
          source?: string
          status?: string
        }
        Relationships: []
      }
      owners: {
        Row: {
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          full_name: string
          id: string
          notes: string | null
        }
        Insert: {
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          full_name: string
          id?: string
          notes?: string | null
        }
        Update: {
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          full_name?: string
          id?: string
          notes?: string | null
        }
        Relationships: []
      }
      properties: {
        Row: {
          address: string | null
          availability: string
          bathrooms: number | null
          bedrooms: number | null
          created_at: string
          credit_eligible: boolean
          currency: string
          description: string
          expenses: number | null
          featured: boolean
          has_garage: boolean
          id: string
          lat: number | null
          lng: number | null
          m2_covered: number | null
          m2_total: number | null
          meta_description: string | null
          meta_title: string | null
          neighborhood: string
          operation: string
          orientation: string | null
          price: number
          professional_use: boolean
          property_type: string
          slug: string
          status: string
          title: string
          updated_at: string
          views_count: number
          year_built: number | null
        }
        Insert: {
          address?: string | null
          availability?: string
          bathrooms?: number | null
          bedrooms?: number | null
          created_at?: string
          credit_eligible?: boolean
          currency?: string
          description?: string
          expenses?: number | null
          featured?: boolean
          has_garage?: boolean
          id?: string
          lat?: number | null
          lng?: number | null
          m2_covered?: number | null
          m2_total?: number | null
          meta_description?: string | null
          meta_title?: string | null
          neighborhood: string
          operation: string
          orientation?: string | null
          price: number
          professional_use?: boolean
          property_type: string
          slug: string
          status?: string
          title: string
          updated_at?: string
          views_count?: number
          year_built?: number | null
        }
        Update: {
          address?: string | null
          availability?: string
          bathrooms?: number | null
          bedrooms?: number | null
          created_at?: string
          credit_eligible?: boolean
          currency?: string
          description?: string
          expenses?: number | null
          featured?: boolean
          has_garage?: boolean
          id?: string
          lat?: number | null
          lng?: number | null
          m2_covered?: number | null
          m2_total?: number | null
          meta_description?: string | null
          meta_title?: string | null
          neighborhood?: string
          operation?: string
          orientation?: string | null
          price?: number
          professional_use?: boolean
          property_type?: string
          slug?: string
          status?: string
          title?: string
          updated_at?: string
          views_count?: number
          year_built?: number | null
        }
        Relationships: []
      }
      property_images: {
        Row: {
          alt: string
          id: string
          position: number
          property_id: string
          url: string
        }
        Insert: {
          alt?: string
          id?: string
          position?: number
          property_id: string
          url: string
        }
        Update: {
          alt?: string
          id?: string
          position?: number
          property_id?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_images_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      rental_contracts: {
        Row: {
          created_at: string
          end_date: string | null
          expensas_amount: number | null
          id: string
          notes: string | null
          owner_id: string
          property_id: string
          rent_amount: number
          rent_currency: string
          start_date: string
          status: string
          tenant_id: string
        }
        Insert: {
          created_at?: string
          end_date?: string | null
          expensas_amount?: number | null
          id?: string
          notes?: string | null
          owner_id: string
          property_id: string
          rent_amount: number
          rent_currency?: string
          start_date: string
          status?: string
          tenant_id: string
        }
        Update: {
          created_at?: string
          end_date?: string | null
          expensas_amount?: number | null
          id?: string
          notes?: string | null
          owner_id?: string
          property_id?: string
          rent_amount?: number
          rent_currency?: string
          start_date?: string
          status?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rental_contracts_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rental_contracts_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rental_contracts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      rental_payments: {
        Row: {
          amount: number | null
          contract_id: string
          created_at: string
          id: string
          notes: string | null
          paid: boolean
          paid_at: string | null
          payment_type: string
          period: string
        }
        Insert: {
          amount?: number | null
          contract_id: string
          created_at?: string
          id?: string
          notes?: string | null
          paid?: boolean
          paid_at?: string | null
          payment_type: string
          period: string
        }
        Update: {
          amount?: number | null
          contract_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          paid?: boolean
          paid_at?: string | null
          payment_type?: string
          period?: string
        }
        Relationships: [
          {
            foreignKeyName: "rental_payments_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "rental_contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          full_name: string
          id: string
          notes: string | null
        }
        Insert: {
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          full_name: string
          id?: string
          notes?: string | null
        }
        Update: {
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          full_name?: string
          id?: string
          notes?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_property_views: {
        Args: { property_id: string }
        Returns: undefined
      }
      current_admin_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      current_admin_profile_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      claim_admin_profile: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
