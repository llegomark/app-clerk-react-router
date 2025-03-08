// app/lib/supabase-types.ts
export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            user_data: {
                Row: {
                    id: number
                    user_id: string
                    content: string
                    created_at?: string // Optional, depending on if you have this column
                }
                Insert: {
                    id?: number // Optional if it's an auto-incrementing column
                    user_id?: string // Optional because it has a default value
                    content: string
                    created_at?: string
                }
                Update: {
                    id?: number
                    user_id?: string
                    content?: string
                    created_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "user_data_user_id_fkey"
                        columns: ["user_id"]
                        referencedRelation: "users" // This might be different in your schema
                        referencedColumns: ["id"]
                    }
                ]
            }
            // Add other tables here as needed
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            requesting_user_id: {
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