import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import type { Database } from "@/types/supabase"
import type { Load, LoadInsert, LoadUpdate } from "@/types/database"

const getSupabase = () => {
  const cookieStore = cookies()
  return createServerActionClient<Database>({ cookies: () => cookieStore })
}

export async function createLoad(load: LoadInsert) {
  const supabase = getSupabase()

  try {
    const { data, error } = await supabase.from("load").insert([load]).select().single()

    if (error) {
      console.error("Error creating load:", error)
      return { error: error.message }
    }

    revalidatePath("/loads")
    return { data }
  } catch (error) {
    console.error("Unexpected error creating load:", error)
    return { error: "An unexpected error occurred." }
  }
}

export async function updateLoad(id: string, load: LoadUpdate) {
  const supabase = getSupabase()

  try {
    const { data, error } = await supabase.from("load").update(load).eq("id", id).select().single()

    if (error) {
      console.error("Error updating load:", error)
      return { error: error.message }
    }

    revalidatePath("/loads")
    return { data }
  } catch (error) {
    console.error("Unexpected error updating load:", error)
    return { error: "An unexpected error occurred." }
  }
}

export async function deleteLoad(id: string) {
  const supabase = getSupabase()

  try {
    const { error } = await supabase.from("load").delete().eq("id", id)

    if (error) {
      console.error("Error deleting load:", error)
      return { error: error.message }
    }

    revalidatePath("/loads")
    return { data: { id } }
  } catch (error) {
    console.error("Unexpected error deleting load:", error)
    return { error: "An unexpected error occurred." }
  }
}

export async function getLoadById(id: string): Promise<{ data: Load | null; error: string | null }> {
  const supabase = getSupabase()

  try {
    const { data, error } = await supabase.from("load").select("*").eq("id", id).single()

    if (error) {
      console.error("Error fetching load by ID:", error)
      return { data: null, error: error.message }
    }

    return { data: data as Load, error: null }
  } catch (error) {
    console.error("Unexpected error fetching load by ID:", error)
    return { data: null, error: "An unexpected error occurred." }
  }
}
