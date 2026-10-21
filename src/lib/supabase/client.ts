// ==============================================================================
// Client-side Supabase Browser Instance (Public Anon Key ONLY)
// ==============================================================================

import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl && typeof window !== 'undefined') {
  console.warn('PUBLIC_SUPABASE_URL is missing. Please set it in your environment.');
}

/**
 * Public browser-safe Supabase client.
 * Strictly adheres to Row Level Security (RLS).
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
