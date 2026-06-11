// Supabase Client Setup
// ---------------------
// 1. Go to supabase.com and create a new project (or use existing)
// 2. Get your Project URL and anon/public key from Settings > API in the Supabase dashboard
// 3. Create a .env file in project root with:
//    VITE_SUPABASE_URL=https://your-project-id.supabase.co
//    VITE_SUPABASE_ANON_KEY=your-anon-key-here
// 4. Enable Google OAuth in Supabase:
//    Authentication > Providers > Google > Enable
//    Add your Google OAuth Client ID and Secret
//    (Get these free from console.cloud.google.com)
// 5. In Supabase SQL Editor, run the schema from README.md
// 6. In Supabase Auth settings > URL Configuration:
//    Site URL: https://your-app-name.vercel.app
//    Redirect URLs: https://your-app-name.vercel.app/**

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const isConfigured = supabaseUrl && supabaseKey &&
  !supabaseUrl.includes('your-project-id') &&
  !supabaseKey.includes('your-anon-key')

export const supabase = isConfigured
  ? createClient(supabaseUrl, supabaseKey)
  : null

export const isSupabaseConfigured = () => !!supabase
