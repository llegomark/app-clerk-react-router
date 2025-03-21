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
                    created_at?: string
                }
                Insert: {
                    id?: number
                    user_id?: string
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
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    }
                ]
            },
            study_notes: {
                Row: {
                    id: number
                    user_id: string
                    title: string
                    content: string
                    category: string | null
                    is_pinned: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: number
                    user_id?: string
                    title: string
                    content: string
                    category?: string | null
                    is_pinned?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: number
                    user_id?: string
                    title?: string
                    content?: string
                    category?: string | null
                    is_pinned?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "study_notes_user_id_fkey"
                        columns: ["user_id"]
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    }
                ]
            }
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