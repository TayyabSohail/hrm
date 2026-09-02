import { createClient } from '@supabase/supabase-js';
import 'server-only';

import { env } from '@/env';

import type { Database } from '@/types/supabase';

// Service-role Supabase client.
export const supabaseAdmin = createClient<Database>(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } },
);
