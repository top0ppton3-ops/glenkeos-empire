/**
 * Supabase Client
 * Browser-side Supabase client for authentication and data access
 */

import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from './info';

// Create Supabase URL from project ID
const supabaseUrl = `https://${projectId}.supabase.co`;

// Create Supabase client
export const supabase = createClient(supabaseUrl, publicAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});
