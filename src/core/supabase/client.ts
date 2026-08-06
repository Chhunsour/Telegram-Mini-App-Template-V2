import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://jowlrfaxkpyhzajcbdah.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impvd2xyZmF4a3B5aHphamNiZGFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUxNjY4MzUsImV4cCI6MjEwMDc0MjgzNX0.CoUnIeM50ecsNTOAkjJk_vfAKyZGhBpjEx2l1y0bPkg'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
