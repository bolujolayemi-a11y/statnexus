import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,            // Enables saving the session to localStorage
    autoRefreshToken: true,          // Automatically refreshes the token when it expires
    detectSessionInUrl: true,        // Useful for OAuth/Magic Link redirects
    storage: window.localStorage,    // Explicitly set storage to local storage
  },
});