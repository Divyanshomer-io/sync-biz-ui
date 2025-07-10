export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      customers: {
        Row: {
          address: string | null
          contact: string | null
          created_at: string
          email: string | null
          gst_number: string | null
          id: string
          name: string
          notes: string | null
          preferred_unit: string | null
          user_id: string | null
        }
        Insert: {
          address?: string | null
          contact?: string | null
          created_at?: string
          email?: string | null
          gst_number?: string | null
          id?: string
          name: string
          notes?: string | null
          preferred_unit?: string | null
          user_id?: string | null
        }
        Update: {
          address?: string | null
          contact?: string | null
          created_at?: string
          email?: string | null
          gst_number?: string | null
          id?: string
          name?: string
          notes?: string | null
          preferred_unit?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      invoice_counters: {
        Row: {
          count: number
          year_month: string
        }
        Insert: {
          count?: number
          year_month: string
        }
        Update: {
          count?: number
          year_month?: string
        }
        Relationships: []
      }
      invoice_items: {
        Row: {
          amount: number
          created_at: string
          id: string
          invoice_id: string
          item_name: string
          quantity: number
          rate_per_unit: number
          unit: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          invoice_id: string
          item_name: string
          quantity: number
          rate_per_unit: number
          unit: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          invoice_id?: string
          item_name?: string
          quantity?: number
          rate_per_unit?: number
          unit?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          created_at: string
          customer_id: string
          delivery_notes: string | null
          driver_contact: string | null
          gst_amount: number
          gst_percentage: number
          id: string
          invoice_date: string
          paid_amount: number | null
          status: string
          subtotal: number
          total_amount: number
          transport_charges: number
          transport_company: string | null
          truck_number: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          delivery_notes?: string | null
          driver_contact?: string | null
          gst_amount?: number
          gst_percentage?: number
          id?: string
          invoice_date?: string
          paid_amount?: number | null
          status?: string
          subtotal?: number
          total_amount?: number
          transport_charges?: number
          transport_company?: string | null
          truck_number?: string | null
          updated_at?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          delivery_notes?: string | null
          driver_contact?: string | null
          gst_amount?: number
          gst_percentage?: number
          id?: string
          invoice_date?: string
          paid_amount?: number | null
          status?: string
          subtotal?: number
          total_amount?: number
          transport_charges?: number
          transport_company?: string | null
          truck_number?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount_paid: number
          created_at: string
          customer_id: string
          id: string
          notes: string | null
          payment_date: string
          payment_mode: string | null
          user_id: string | null
        }
        Insert: {
          amount_paid: number
          created_at?: string
          customer_id: string
          id?: string
          notes?: string | null
          payment_date?: string
          payment_mode?: string | null
          user_id?: string | null
        }
        Update: {
          amount_paid?: number
          created_at?: string
          customer_id?: string
          id?: string
          notes?: string | null
          payment_date?: string
          payment_mode?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      payments_made: {
        Row: {
          amount: number
          created_at: string | null
          date: string | null
          id: string
          mode: string | null
          user_id: string | null
          vendor_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          date?: string | null
          id?: string
          mode?: string | null
          user_id?: string | null
          vendor_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          date?: string | null
          id?: string
          mode?: string | null
          user_id?: string | null
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_made_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      purchases: {
        Row: {
          created_at: string | null
          date: string | null
          id: string
          item: string
          quantity: number
          rate: number
          status: string | null
          total_amount: number | null
          user_id: string | null
          vendor_id: string | null
        }
        Insert: {
          created_at?: string | null
          date?: string | null
          id?: string
          item: string
          quantity: number
          rate: number
          status?: string | null
          total_amount?: number | null
          user_id?: string | null
          vendor_id?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string | null
          id?: string
          item?: string
          quantity?: number
          rate?: number
          status?: string | null
          total_amount?: number | null
          user_id?: string | null
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "purchases_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      sales: {
        Row: {
          created_at: string
          customer_id: string
          delivery_notes: string | null
          driver_contact: string | null
          gst_amount: number
          gst_percentage: number | null
          id: string
          invoice_date: string
          item_name: string
          quantity: number
          rate_per_unit: number
          subtotal: number
          total_amount: number
          transport_charges: number | null
          transport_company: string | null
          truck_number: string | null
          unit: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          customer_id: string
          delivery_notes?: string | null
          driver_contact?: string | null
          gst_amount: number
          gst_percentage?: number | null
          id?: string
          invoice_date?: string
          item_name: string
          quantity: number
          rate_per_unit: number
          subtotal: number
          total_amount: number
          transport_charges?: number | null
          transport_company?: string | null
          truck_number?: string | null
          unit: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          customer_id?: string
          delivery_notes?: string | null
          driver_contact?: string | null
          gst_amount?: number
          gst_percentage?: number | null
          id?: string
          invoice_date?: string
          item_name?: string
          quantity?: number
          rate_per_unit?: number
          subtotal?: number
          total_amount?: number
          transport_charges?: number | null
          transport_company?: string | null
          truck_number?: string | null
          unit?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sales_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          address: string | null
          business_type: string | null
          created_at: string | null
          full_name: string
          gst_number: string | null
          id: string
          organization_name: string
          phone: string | null
        }
        Insert: {
          address?: string | null
          business_type?: string | null
          created_at?: string | null
          full_name: string
          gst_number?: string | null
          id: string
          organization_name: string
          phone?: string | null
        }
        Update: {
          address?: string | null
          business_type?: string | null
          created_at?: string | null
          full_name?: string
          gst_number?: string | null
          id?: string
          organization_name?: string
          phone?: string | null
        }
        Relationships: []
      }
      vendors: {
        Row: {
          address: string | null
          contact: string | null
          created_at: string | null
          email: string | null
          gstin: string | null
          id: string
          name: string
          user_id: string | null
        }
        Insert: {
          address?: string | null
          contact?: string | null
          created_at?: string | null
          email?: string | null
          gstin?: string | null
          id?: string
          name: string
          user_id?: string | null
        }
        Update: {
          address?: string | null
          contact?: string | null
          created_at?: string | null
          email?: string | null
          gstin?: string | null
          id?: string
          name?: string
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_custom_invoice_id: {
        Args: Record<PropertyKey, never>
        Returns: string
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
