import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Server client prefers SUPABASE_SERVICE_ROLE_KEY to perform verified API Route operations
// while PostgreSQL RLS blocks direct anonymous client-side REST API modifications.
const activeServerKey = supabaseServiceKey || supabaseAnonKey;

export const isSupabaseConfigured = Boolean(supabaseUrl && activeServerKey);

export const supabaseServer = isSupabaseConfigured
  ? createClient(supabaseUrl, activeServerKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : null;
