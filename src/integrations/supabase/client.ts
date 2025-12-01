import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hybpteqmxlxqbaynihbb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5YnB0ZXFteGx4cWJheW5paGJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMwNTc3MzIsImV4cCI6MjA0ODYzMzczMn0.sb_publishable_jjhi9VkRSRokgM9Va8CLNQ_B_ZsCl4W';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});
