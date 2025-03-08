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
            },
            bookmarked_questions: {
                Row: {
                    id: number
                    user_id: string
                    question_id: number
                    category_id: number
                    category_name: string
                    question_text: string
                    bookmarked_at: string
                    question_data?: string // Added this field
                }
                Insert: {
                    id?: number
                    user_id?: string
                    question_id: number
                    category_id: number
                    category_name: string
                    question_text: string
                    bookmarked_at?: string
                    question_data?: string // Added this field
                }
                Update: {
                    id?: number
                    user_id?: string
                    question_id?: number
                    category_id?: number
                    category_name?: string
                    question_text?: string
                    bookmarked_at?: string
                    question_data?: string // Added this field
                }
                Relationships: [
                    {
                        foreignKeyName: "bookmarked_questions_user_id_fkey"
                        columns: ["user_id"]
                        referencedRelation: "users"
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