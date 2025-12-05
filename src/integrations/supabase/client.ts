import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hybpteqmxlxqbaynihbb.supabase.co';
const supabaseAnonKey = 'sb_publishable_jjhi9VkRSRokgM9Va8CLNQ_B_ZsCl4W';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
});
