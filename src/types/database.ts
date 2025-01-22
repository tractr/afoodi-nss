export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      Config: {
        Row: {
          key: string
          value: string
        }
        Insert: {
          key: string
          value: string
        }
        Update: {
          key?: string
          value?: string
        }
        Relationships: []
      }
      File: {
        Row: {
          created_at: string
          file_bucket: string
          file_path: string
          id: string
        }
        Insert: {
          created_at?: string
          file_bucket: string
          file_path: string
          id?: string
        }
        Update: {
          created_at?: string
          file_bucket?: string
          file_path?: string
          id?: string
        }
        Relationships: []
      }
      Menu: {
        Row: {
          created_at: string
          file: string | null
          id: string
          label: string
          owner: string
          updated_date: string | null
          version: number
        }
        Insert: {
          created_at?: string
          file?: string | null
          id?: string
          label: string
          owner: string
          updated_date?: string | null
          version?: number
        }
        Update: {
          created_at?: string
          file?: string | null
          id?: string
          label?: string
          owner?: string
          updated_date?: string | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "Menu_file_fkey"
            columns: ["file"]
            isOneToOne: false
            referencedRelation: "File"
            referencedColumns: ["id"]
          },
        ]
      }
      Sell: {
        Row: {
          created_at: string
          file: string | null
          id: string
          label: string
          owner: string
          updated_date: string | null
          version: number
        }
        Insert: {
          created_at?: string
          file?: string | null
          id?: string
          label: string
          owner: string
          updated_date?: string | null
          version?: number
        }
        Update: {
          created_at?: string
          file?: string | null
          id?: string
          label?: string
          owner?: string
          updated_date?: string | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "Sell_file_fkey"
            columns: ["file"]
            isOneToOne: false
            referencedRelation: "File"
            referencedColumns: ["id"]
          },
        ]
      }
      StreamIAMenuRunContext: {
        Row: {
          created_at: string
          id: string
          menu: string
          run: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          menu: string
          run: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          menu?: string
          run?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "MenuProcessState_menu_fkey"
            columns: ["menu"]
            isOneToOne: false
            referencedRelation: "Menu"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "StreamIAMenuState_state_fkey"
            columns: ["run"]
            isOneToOne: false
            referencedRelation: "StreamIARun"
            referencedColumns: ["id"]
          },
        ]
      }
      StreamIARun: {
        Row: {
          created_at: string
          current_step: Database["public"]["Enums"]["StreamIAStep"] | null
          error_message: string | null
          id: string
          status: Database["public"]["Enums"]["StreamIAProcessStatus"]
          type: Database["public"]["Enums"]["StreamIAType"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          current_step?: Database["public"]["Enums"]["StreamIAStep"] | null
          error_message?: string | null
          id?: string
          status?: Database["public"]["Enums"]["StreamIAProcessStatus"]
          type: Database["public"]["Enums"]["StreamIAType"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          current_step?: Database["public"]["Enums"]["StreamIAStep"] | null
          error_message?: string | null
          id?: string
          status?: Database["public"]["Enums"]["StreamIAProcessStatus"]
          type?: Database["public"]["Enums"]["StreamIAType"]
          updated_at?: string | null
        }
        Relationships: []
      }
      StreamIARunStep: {
        Row: {
          created_at: string
          error_message: string | null
          finished_at: string | null
          id: string
          input: Json
          output: Json | null
          run: string
          step: Database["public"]["Enums"]["StreamIAStep"]
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          finished_at?: string | null
          id?: string
          input: Json
          output?: Json | null
          run: string
          step: Database["public"]["Enums"]["StreamIAStep"]
        }
        Update: {
          created_at?: string
          error_message?: string | null
          finished_at?: string | null
          id?: string
          input?: Json
          output?: Json | null
          run?: string
          step?: Database["public"]["Enums"]["StreamIAStep"]
        }
        Relationships: [
          {
            foreignKeyName: "StreamIAHistory_state_fkey"
            columns: ["run"]
            isOneToOne: false
            referencedRelation: "StreamIARun"
            referencedColumns: ["id"]
          },
        ]
      }
      StreamIASellRunContext: {
        Row: {
          created_at: string
          id: string
          run: string
          sell: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          run: string
          sell: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          run?: string
          sell?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "StreamIASellState_sell_fkey"
            columns: ["sell"]
            isOneToOne: false
            referencedRelation: "Sell"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "StreamIASellState_state_fkey"
            columns: ["run"]
            isOneToOne: false
            referencedRelation: "StreamIARun"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      StreamIAProcessStatus:
        | "created"
        | "processing"
        | "step-finished"
        | "fully-finished"
        | "error"
      StreamIAStep: "menu_step1" | "menu_step2" | "sell_step1" | "sell_step2"
      StreamIAType: "menu" | "sell"
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

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

