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
      biens: {
        Row: {
          adresse: string
          charges_mensuelles: number | null
          code_postal: string | null
          created_at: string
          credit_mensuel: number | null
          date_acquisition: string | null
          description: string | null
          id: string
          nom: string
          pays: string | null
          photo_principale: string | null
          updated_at: string | null
          user_id: string | null
          valeur_acquisition: number | null
          ville: string | null
        }
        Insert: {
          adresse: string
          charges_mensuelles?: number | null
          code_postal?: string | null
          created_at?: string
          credit_mensuel?: number | null
          date_acquisition?: string | null
          description?: string | null
          id?: string
          nom: string
          pays?: string | null
          photo_principale?: string | null
          updated_at?: string | null
          user_id?: string | null
          valeur_acquisition?: number | null
          ville?: string | null
        }
        Update: {
          adresse?: string
          charges_mensuelles?: number | null
          code_postal?: string | null
          created_at?: string
          credit_mensuel?: number | null
          date_acquisition?: string | null
          description?: string | null
          id?: string
          nom?: string
          pays?: string | null
          photo_principale?: string | null
          updated_at?: string | null
          user_id?: string | null
          valeur_acquisition?: number | null
          ville?: string | null
        }
        Relationships: []
      }
      colocataires: {
        Row: {
          contrat_id: string
          date_entree: string
          date_sortie: string | null
          email: string | null
          id: string
          nom_complet: string
          part_loyer: number
          telephone: string | null
        }
        Insert: {
          contrat_id: string
          date_entree: string
          date_sortie?: string | null
          email?: string | null
          id?: string
          nom_complet: string
          part_loyer: number
          telephone?: string | null
        }
        Update: {
          contrat_id?: string
          date_entree?: string
          date_sortie?: string | null
          email?: string | null
          id?: string
          nom_complet?: string
          part_loyer?: number
          telephone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "colocataires_contrat_id_fkey"
            columns: ["contrat_id"]
            isOneToOne: false
            referencedRelation: "contrats"
            referencedColumns: ["id"]
          },
        ]
      }
      contrats: {
        Row: {
          actif: boolean
          bien_id: string
          caution: number | null
          charges_forfaitaires: number | null
          date_debut: string
          date_fin: string | null
          id: string
          loyer_total: number
        }
        Insert: {
          actif?: boolean
          bien_id: string
          caution?: number | null
          charges_forfaitaires?: number | null
          date_debut: string
          date_fin?: string | null
          id?: string
          loyer_total: number
        }
        Update: {
          actif?: boolean
          bien_id?: string
          caution?: number | null
          charges_forfaitaires?: number | null
          date_debut?: string
          date_fin?: string | null
          id?: string
          loyer_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "contrats_bien_id_fkey"
            columns: ["bien_id"]
            isOneToOne: false
            referencedRelation: "biens"
            referencedColumns: ["id"]
          },
        ]
      }
      Document: {
        Row: {
          createdAt: string
          fileUrl: string | null
          id: string
          name: string
          propertyId: string
          tenantId: string | null
          type: string
          updatedAt: string
        }
        Insert: {
          createdAt?: string
          fileUrl?: string | null
          id: string
          name: string
          propertyId: string
          tenantId?: string | null
          type: string
          updatedAt: string
        }
        Update: {
          createdAt?: string
          fileUrl?: string | null
          id?: string
          name?: string
          propertyId?: string
          tenantId?: string | null
          type?: string
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "Document_propertyId_fkey"
            columns: ["propertyId"]
            isOneToOne: false
            referencedRelation: "Property"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Document_tenantId_fkey"
            columns: ["tenantId"]
            isOneToOne: false
            referencedRelation: "Tenant"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          bien_id: string
          contrat_id: string | null
          date_creation: string
          date_expiration: string | null
          fichier_url: string
          id: string
          type: string
        }
        Insert: {
          bien_id: string
          contrat_id?: string | null
          date_creation: string
          date_expiration?: string | null
          fichier_url: string
          id?: string
          type: string
        }
        Update: {
          bien_id?: string
          contrat_id?: string | null
          date_creation?: string
          date_expiration?: string | null
          fichier_url?: string
          id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_bien_id_fkey"
            columns: ["bien_id"]
            isOneToOne: false
            referencedRelation: "biens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_contrat_id_fkey"
            columns: ["contrat_id"]
            isOneToOne: false
            referencedRelation: "contrats"
            referencedColumns: ["id"]
          },
        ]
      }
      paiements_backup: {
        Row: {
          colocataire_id: string | null
          contrat_id: string | null
          date_paiement: string | null
          id: string | null
          mois_concerne: string | null
          montant: number | null
          preuve_paiement_url: string | null
          statut: string | null
        }
        Insert: {
          colocataire_id?: string | null
          contrat_id?: string | null
          date_paiement?: string | null
          id?: string | null
          mois_concerne?: string | null
          montant?: number | null
          preuve_paiement_url?: string | null
          statut?: string | null
        }
        Update: {
          colocataire_id?: string | null
          contrat_id?: string | null
          date_paiement?: string | null
          id?: string | null
          mois_concerne?: string | null
          montant?: number | null
          preuve_paiement_url?: string | null
          statut?: string | null
        }
        Relationships: []
      }
      Payment: {
        Row: {
          amount: number
          createdAt: string
          date: string
          description: string | null
          id: string
          propertyId: string
          tenantId: string | null
          type: string
          updatedAt: string
        }
        Insert: {
          amount: number
          createdAt?: string
          date: string
          description?: string | null
          id: string
          propertyId: string
          tenantId?: string | null
          type: string
          updatedAt: string
        }
        Update: {
          amount?: number
          createdAt?: string
          date?: string
          description?: string | null
          id?: string
          propertyId?: string
          tenantId?: string | null
          type?: string
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "Payment_propertyId_fkey"
            columns: ["propertyId"]
            isOneToOne: false
            referencedRelation: "Property"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Payment_tenantId_fkey"
            columns: ["tenantId"]
            isOneToOne: false
            referencedRelation: "Tenant"
            referencedColumns: ["id"]
          },
        ]
      }
      profils: {
        Row: {
          created_at: string
          email: string
          id: string
          nom_complet: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          nom_complet?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          nom_complet?: string | null
        }
        Relationships: []
      }
      Property: {
        Row: {
          address: string
          charges: number | null
          city: string
          country: string
          createdAt: string
          id: string
          mortgage: number | null
          name: string
          ownerId: string
          postalCode: string
          updatedAt: string
        }
        Insert: {
          address: string
          charges?: number | null
          city: string
          country: string
          createdAt?: string
          id: string
          mortgage?: number | null
          name: string
          ownerId: string
          postalCode: string
          updatedAt: string
        }
        Update: {
          address?: string
          charges?: number | null
          city?: string
          country?: string
          createdAt?: string
          id?: string
          mortgage?: number | null
          name?: string
          ownerId?: string
          postalCode?: string
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "Property_ownerId_fkey"
            columns: ["ownerId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      Tenant: {
        Row: {
          createdAt: string
          email: string
          firstName: string
          id: string
          lastName: string
          moveInDate: string
          moveOutDate: string | null
          phone: string | null
          propertyId: string
          rentAmount: number
          updatedAt: string
        }
        Insert: {
          createdAt?: string
          email: string
          firstName: string
          id: string
          lastName: string
          moveInDate: string
          moveOutDate?: string | null
          phone?: string | null
          propertyId: string
          rentAmount: number
          updatedAt: string
        }
        Update: {
          createdAt?: string
          email?: string
          firstName?: string
          id?: string
          lastName?: string
          moveInDate?: string
          moveOutDate?: string | null
          phone?: string | null
          propertyId?: string
          rentAmount?: number
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "Tenant_propertyId_fkey"
            columns: ["propertyId"]
            isOneToOne: false
            referencedRelation: "Property"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          bien_id: string
          categorie: string | null
          colocataire_id: string | null
          contrat_id: string | null
          date: string
          description: string | null
          id: string
          montant: number
          periodicite: string
          type: string
        }
        Insert: {
          bien_id: string
          categorie?: string | null
          colocataire_id?: string | null
          contrat_id?: string | null
          date: string
          description?: string | null
          id?: string
          montant: number
          periodicite: string
          type: string
        }
        Update: {
          bien_id?: string
          categorie?: string | null
          colocataire_id?: string | null
          contrat_id?: string | null
          date?: string
          description?: string | null
          id?: string
          montant?: number
          periodicite?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_bien_id_fkey"
            columns: ["bien_id"]
            isOneToOne: false
            referencedRelation: "biens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_colocataire_id_fkey"
            columns: ["colocataire_id"]
            isOneToOne: false
            referencedRelation: "colocataires"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_contrat_id_fkey"
            columns: ["contrat_id"]
            isOneToOne: false
            referencedRelation: "contrats"
            referencedColumns: ["id"]
          },
        ]
      }
      User: {
        Row: {
          createdAt: string
          email: string
          id: string
        }
        Insert: {
          createdAt?: string
          email: string
          id: string
        }
        Update: {
          createdAt?: string
          email?: string
          id?: string
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
