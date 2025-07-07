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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { customerName, companyId, userId, loadData } = body

    if (!customerName || !companyId || !userId || !loadData) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    console.log("🔍 Processing load creation request:", {
      customerName,
      companyId,
      userId,
      loadNumber: loadData.load_number,
    })

    // First, verify the company exists
    const { data: company, error: companyError } = await supabaseAdmin
      .from("companies")
      .select("*")
      .eq("id", companyId)
      .single()

    if (companyError || !company) {
      console.error("Company not found:", companyError)

      // If it's the demo company ID, create it with minimal required fields
      if (companyId === "550e8400-e29b-41d4-a716-446655440000") {
        console.log("Creating demo company with minimal fields...")

        // Create with only the essential fields that should exist
        const companyData: any = {
          id: companyId,
          name: "Demo Transportation Company",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }

        // Add optional fields if they exist in the table
        const { data: tableInfo } = await supabaseAdmin
          .from("information_schema.columns")
          .select("column_name")
          .eq("table_name", "companies")
          .eq("table_schema", "public")

        const columnNames = tableInfo?.map((col) => col.column_name) || []

        if (columnNames.includes("address")) companyData.address = "123 Demo Street"
        if (columnNames.includes("city")) companyData.city = "Demo City"
        if (columnNames.includes("state")) companyData.state = "TX"
        if (columnNames.includes("zip")) companyData.zip = "75001"
        if (columnNames.includes("zip_code")) companyData.zip_code = "75001"
        if (columnNames.includes("postal_code")) companyData.postal_code = "75001"
        if (columnNames.includes("phone")) companyData.phone = "(555) 123-4567"
        if (columnNames.includes("email")) companyData.email = "admin@demo-transport.com"
        if (columnNames.includes("dot_number")) companyData.dot_number = "12345678"
        if (columnNames.includes("mc_number")) companyData.mc_number = "MC-123456"

        const { data: newCompany, error: createCompanyError } = await supabaseAdmin
          .from("companies")
          .insert(companyData)
          .select()
          .single()

        if (createCompanyError) {
          console.error("Failed to create demo company:", createCompanyError)
          return NextResponse.json(
            {
              error: `Company not found and could not be created: ${createCompanyError.message}`,
            },
            { status: 400 },
          )
        }

        console.log("✅ Demo company created:", newCompany)
      } else {
        return NextResponse.json({ error: "Invalid company ID" }, { status: 400 })
      }
    }

    // Verify the user exists and belongs to the company
    const { data: user, error: userError } = await supabaseAdmin
      .from("users")
      .select("id, company_id, role")
      .eq("id", userId)
      .single()

    if (userError || !user) {
      console.error("User not found:", userError)

      // If it's the test user ID, create it
      if (userId === "11111111-1111-1111-1111-111111111111") {
        console.log("Creating test user...")

        const { data: newUser, error: createUserError } = await supabaseAdmin
          .from("users")
          .insert({
            id: userId,
            email: "test@demo-transport.com",
            name: "Test User",
            role: "dispatcher",
            company_id: companyId,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single()

        if (createUserError) {
          console.error("Failed to create test user:", createUserError)
          return NextResponse.json({ error: "Invalid user ID and could not create test user" }, { status: 400 })
        }

        console.log("✅ Test user created:", newUser)
      } else {
        return NextResponse.json({ error: "Invalid user ID" }, { status: 400 })
      }
    } else if (user.company_id !== companyId) {
      console.error("User company mismatch:", { userCompany: user.company_id, requestCompany: companyId })

      // Update the user's company_id if it's the test user
      if (userId === "11111111-1111-1111-1111-111111111111") {
        const { error: updateError } = await supabaseAdmin
          .from("users")
          .update({ company_id: companyId })
          .eq("id", userId)

        if (updateError) {
          console.error("Failed to update test user company:", updateError)
          return NextResponse.json({ error: "User does not belong to the specified company" }, { status: 403 })
        }

        console.log("✅ Updated test user company_id to:", companyId)
      } else {
        return NextResponse.json({ error: "User does not belong to the specified company" }, { status: 403 })
      }
    }

    // Find or create customer using admin client
    let customerId: string
    const { data: existingCustomer, error: customerError } = await supabaseAdmin
      .from("customers")
      .select("id")
      .eq("name", customerName)
      .eq("company_id", companyId)
      .maybeSingle()

    if (customerError) {
      console.error("Error checking for existing customer:", customerError)
      return NextResponse.json(
        { error: `Error checking for existing customer: ${customerError.message}` },
        { status: 500 },
      )
    }

    if (existingCustomer) {
      customerId = existingCustomer.id
      console.log("✅ Found existing customer:", customerId)
    } else {
      // Create new customer using admin client
      const { data: newCustomer, error: createError } = await supabaseAdmin
        .from("customers")
        .insert({
          name: customerName,
          company_id: companyId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select("id")
        .single()

      if (createError || !newCustomer) {
        console.error("Error creating customer:", createError)
        return NextResponse.json(
          { error: `Error creating customer: ${createError?.message || "Unknown error"}` },
          { status: 500 },
        )
      }

      customerId = newCustomer.id
      console.log("✅ Created new customer:", customerId)
    }

    // Generate unique load number
    const generateUniqueLoadNumber = async (baseLoadNumber?: string): Promise<string> => {
      let loadNumber = baseLoadNumber
      let attempt = 0
      const maxAttempts = 10

      while (attempt < maxAttempts) {
        if (!loadNumber || attempt > 0) {
          const timestamp = Date.now().toString()
          const random = Math.floor(Math.random() * 10000)
            .toString()
            .padStart(4, "0")
          const suffix = attempt > 0 ? `-${attempt}` : ""
          loadNumber = `LOAD-${timestamp.slice(-8)}${random}${suffix}`
        }

        // Check if this load number already exists for this company
        const { data: existingLoad, error: checkError } = await supabaseAdmin
          .from("loads")
          .select("id")
          .eq("company_id", companyId)
          .eq("load_number", loadNumber)
          .maybeSingle()

        if (checkError) {
          console.error("Error checking load number uniqueness:", checkError)
          throw new Error(`Failed to verify load number uniqueness: ${checkError.message}`)
        }

        if (!existingLoad) {
          return loadNumber // This load number is unique
        }

        attempt++
        loadNumber = "" // Reset for next attempt
      }

      throw new Error("Unable to generate a unique load number after multiple attempts")
    }

    const finalLoadNumber = await generateUniqueLoadNumber(loadData.load_number)

    // Create the load using admin client
    const finalLoadData = {
      ...loadData,
      load_number: finalLoadNumber,
      company_id: companyId,
      customer_id: customerId,
      dispatcher_id: userId,
      created_by: userId,
      status: "new",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    console.log("🚀 Creating load with unique load number:", finalLoadNumber)

    const { data: newLoad, error: loadError } = await supabaseAdmin
      .from("loads")
      .insert(finalLoadData)
      .select()
      .single()

    if (loadError) {
      console.error("❌ Error creating load:", loadError)
      return NextResponse.json({ error: `Error creating load: ${loadError.message}` }, { status: 500 })
    }

    console.log("✅ Load created successfully:", newLoad)

    return NextResponse.json({
      success: true,
      load: newLoad,
      customer: { id: customerId },
    })
  } catch (error: any) {
    console.error("❌ Error in load creation API:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
