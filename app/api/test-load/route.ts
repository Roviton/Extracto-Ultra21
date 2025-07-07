import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("🧪 API: Received request body:", body)

    const { customer_name, company_id } = body

    if (!customer_name) {
      return NextResponse.json({ error: "Customer name is required" }, { status: 400 })
    }

    if (!company_id) {
      return NextResponse.json({ error: "Company ID is required" }, { status: 400 })
    }

    console.log("🧪 API: Creating test load with company_id:", company_id)

    // First, let's get a customer_id from the customers table
    const { data: customers, error: customerError } = await supabase
      .from("customers")
      .select("id")
      .eq("company_id", company_id)
      .limit(1)

    if (customerError) {
      console.error("🧪 API: Customer lookup error:", customerError)
      return NextResponse.json({ error: "Failed to find customer: " + customerError.message }, { status: 500 })
    }

    if (!customers || customers.length === 0) {
      console.error("🧪 API: No customers found for company")
      return NextResponse.json({ error: "No customers found for this company" }, { status: 500 })
    }

    const customerId = customers[0].id
    console.log("🧪 API: Found customer ID:", customerId)

    // Get a dispatcher_id (user) for this company
    const { data: users, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("company_id", company_id)
      .limit(1)

    if (userError) {
      console.error("🧪 API: User lookup error:", userError)
      return NextResponse.json({ error: "Failed to find user: " + userError.message }, { status: 500 })
    }

    if (!users || users.length === 0) {
      console.error("🧪 API: No users found for company")
      return NextResponse.json({ error: "No users found for this company" }, { status: 500 })
    }

    const dispatcherId = users[0].id
    console.log("🧪 API: Found dispatcher ID:", dispatcherId)

    // Use the EXACT column names from your schema
    const testLoadData = {
      load_number: `TEST-${Date.now()}`,
      company_id: company_id,
      customer_id: customerId,
      dispatcher_id: dispatcherId,
      status: "new",
      pickup_address: "123 Test Pickup St",
      pickup_city: "Test City",
      pickup_state: "TX",
      pickup_zip: "12345",
      pickup_date: new Date().toISOString().split("T")[0],
      delivery_address: "456 Test Delivery Ave",
      delivery_city: "Test Delivery City",
      delivery_state: "CA",
      delivery_zip: "67890",
      delivery_date: new Date(Date.now() + 86400000).toISOString().split("T")[0],
      rate: 1500.0,
      commodity: "Test Freight",
      weight: 40000,
      pieces: 1,
      equipment_type: "Van",
      distance: 500,
      rpm: 3.0,
    }

    console.log("🧪 API: Inserting load data:", testLoadData)

    const { data, error } = await supabase.from("loads").insert(testLoadData).select().single()

    if (error) {
      console.error("🧪 API: Supabase error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("🧪 API: Success! Created load:", data)
    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error("🧪 API: Unexpected error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
