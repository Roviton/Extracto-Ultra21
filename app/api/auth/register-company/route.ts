import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/database"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Create admin client that bypasses RLS
const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

// Regular client for auth operations
const supabase = createClient<Database>(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      companyName,
      businessAddress,
      businessPhone,
      dotNumber,
      mcNumber,
      adminName,
      adminEmail,
      adminPhone,
      password,
    } = body

    console.log("🚀 Starting company registration API process...")

    // Step 1: Create Supabase Auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: adminEmail,
      password: password,
      options: {
        data: {
          full_name: adminName,
          phone: adminPhone,
          role: "admin",
          company_name: companyName,
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    })

    if (authError) {
      console.error("❌ Auth error:", authError)
      return NextResponse.json({ error: `Authentication failed: ${authError.message}` }, { status: 400 })
    }

    if (!authData.user) {
      return NextResponse.json({ error: "Failed to create user account" }, { status: 400 })
    }

    console.log("✅ Auth user created:", authData.user.id)

    // Step 2: Create company record using admin client
    const { data: companyData, error: companyError } = await supabaseAdmin
      .from("companies")
      .insert({
        name: companyName,
        address: businessAddress,
        phone: businessPhone,
        email: adminEmail,
        dot_number: dotNumber || null,
        mc_number: mcNumber || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (companyError) {
      console.error("❌ Company creation error:", companyError)
      return NextResponse.json({ error: `Failed to create company: ${companyError.message}` }, { status: 500 })
    }

    console.log("✅ Company created:", companyData.id)

    // Step 3: Create user profile using admin client
    const { data: userProfile, error: userError } = await supabaseAdmin
      .from("users")
      .insert({
        id: authData.user.id,
        company_id: companyData.id,
        email: adminEmail,
        name: adminName,
        role: "admin",
        phone: adminPhone,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (userError) {
      console.error("❌ User profile creation error:", userError)
      return NextResponse.json({ error: `Failed to create user profile: ${userError.message}` }, { status: 500 })
    }

    console.log("✅ User profile created:", userProfile.id)

    return NextResponse.json({
      success: true,
      user: userProfile,
      company: companyData,
      needsEmailConfirmation: !authData.session,
    })
  } catch (error: any) {
    console.error("❌ Registration API error:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
