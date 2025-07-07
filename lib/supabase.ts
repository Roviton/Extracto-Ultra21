import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/database"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables")
}

// Server-side Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Force production URL for email redirects
    redirectTo: process.env.NODE_ENV === "production" ? "https://ultra21.com/auth/callback" : undefined,
  },
})

console.log("🔧 Server Supabase Configuration:")
console.log("- Environment:", process.env.NODE_ENV)
console.log("- Supabase URL:", supabaseUrl)
console.log("- Auth Redirect:", process.env.NODE_ENV === "production" ? "https://ultra21.com/auth/callback" : "default")
