// ============================================================================
// Supabase Server Client (Server-side Only)
// Secrets are strictly contained here and never exposed to the browser
// ============================================================================

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseKey &&
    !supabaseUrl.includes('your-supabase-url') &&
    !supabaseKey.includes('your-supabase-key')
);

export const supabaseServer = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseKey!, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    })
  : null;

