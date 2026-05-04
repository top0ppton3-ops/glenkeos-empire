import 'react-native-url-polyfill/auto';
import {createClient} from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.SUPABASE_URL || 'https://beswluhdxaphtitaovly.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJlc3dsdWhkeGFwaHRpdGFvdmx5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4MDY2MzgsImV4cCI6MjA5MjM4MjYzOH0.XMxin_yjhgp3si6G_PFAWdrsaBzdJgfJcgyc-NQEXhw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
