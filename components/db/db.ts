import { createClient } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'

export const supabaseUrl = 'https://lmuoeghciybukwscyvxo.supabase.co'
export const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxtdW9lZ2hjaXlidWt3c2N5dnhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxMzE3NzcsImV4cCI6MjA3MDcwNzc3N30.WsdSsA5IfkdXl4_IbRH-tSGpz_5yr3JeDa2XJMzDkgU'
export const bucket = 'dev'

export const db = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})