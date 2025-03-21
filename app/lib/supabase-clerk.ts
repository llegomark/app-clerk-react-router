// app/lib/supabase-clerk.ts
import { createClient } from '@supabase/supabase-js';
import { useAuth } from '@clerk/react-router';
import type { Database } from './supabase-types';

// Environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// Singleton instance of the Supabase client
let supabaseClient: ReturnType<typeof createClient<Database>> | null = null;

// For client-side use
export function useSupabase() {
    const { getToken } = useAuth();

    if (!supabaseClient) {
        // Create the client only once
        supabaseClient = createClient<Database>(supabaseUrl, supabaseKey, {
            global: {
                fetch: async (url, options = {}) => {
                    try {
                        // Get the Clerk token with the Supabase template
                        const clerkToken = await getToken({ template: 'supabase' });

                        // For debugging
                        console.log("Supabase auth token generated:", !!clerkToken);

                        // Add the token to the request
                        const headers = new Headers(options?.headers);
                        if (clerkToken) {
                            headers.set('Authorization', `Bearer ${clerkToken}`);
                        }

                        return fetch(url, {
                            ...options,
                            headers
                        });
                    } catch (error) {
                        console.error("Error getting Clerk token:", error);
                        // Fall back to regular fetch without the token
                        return fetch(url, options);
                    }
                }
            },
            auth: {
                persistSession: false, // This helps prevent some auth state conflicts
                autoRefreshToken: false, // Let Clerk handle the refresh tokens
            }
        });
    }

    // Return the singleton instance
    return supabaseClient;
}

// For use in loaders/actions that have access to auth
export async function createClerkSupabaseServer(getToken: () => Promise<string | null>) {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

    return createClient<Database>(supabaseUrl, supabaseKey, {
        global: {
            fetch: async (url, options = {}) => {
                try {
                    // Get the Clerk token with the Supabase template
                    const clerkToken = await getToken();

                    // For debugging
                    console.log("Server Supabase auth token generated:", !!clerkToken);

                    // Add the token to the request
                    const headers = new Headers(options?.headers);
                    if (clerkToken) {
                        headers.set('Authorization', `Bearer ${clerkToken}`);
                    }

                    return fetch(url, {
                        ...options,
                        headers
                    });
                } catch (error) {
                    console.error("Error getting Clerk token:", error);
                    // Fall back to regular fetch without the token
                    return fetch(url, options);
                }
            }
        }
    });
}