export interface Database {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string
          name: string
          address: string | null
          city: string | null
          state: string | null
          zip: string | null
          phone: string | null
          email: string | null
          mc_number: string | null
          dot_number: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          address?: string | null
          city?: string | null
          state?: string | null
          zip?: string | null
          phone?: string | null
          email?: string | null
          mc_number?: string | null
          dot_number?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          address?: string | null
          city?: string | null
          state?: string | null
          zip?: string | null
          phone?: string | null
          email?: string | null
          mc_number?: string | null
          dot_number?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string
          company_id: string
          email: string
          name: string
          role: "admin" | "dispatcher"
          avatar_url: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          email: string
          name: string
          role: "admin" | "dispatcher"
          avatar_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          email?: string
          name?: string
          role?: "admin" | "dispatcher"
          avatar_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      loads: {
        Row: {
          id: string
          company_id: string
          load_number: string
          status:
            | "new"
            | "assigned"
            | "accepted"
            | "refused"
            | "in_progress"
            | "completed"
            | "cancelled"
            | "other_archived"
          pickup_date: string | null
          delivery_date: string | null
          pickup_address: string | null
          pickup_city: string | null
          pickup_state: string | null
          pickup_zip: string | null
          delivery_address: string | null
          delivery_city: string | null
          delivery_state: string | null
          delivery_zip: string | null
          commodity: string | null
          weight: number | null
          pieces: number | null
          equipment_type: string | null
          rate: number | null
          distance: number | null
          distance_miles: number | null
          rpm: number | null
          customer_id: string | null
          dispatcher_id: string | null
          special_instructions: string | null
          appointment_number: string | null
          pdf_reference: string | null
          created_by: string
          assigned_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          load_number: string
          status?:
            | "new"
            | "assigned"
            | "accepted"
            | "refused"
            | "in_progress"
            | "completed"
            | "cancelled"
            | "other_archived"
          pickup_date?: string | null
          delivery_date?: string | null
          pickup_address?: string | null
          pickup_city?: string | null
          pickup_state?: string | null
          pickup_zip?: string | null
          delivery_address?: string | null
          delivery_city?: string | null
          delivery_state?: string | null
          delivery_zip?: string | null
          commodity?: string | null
          weight?: number | null
          pieces?: number | null
          equipment_type?: string | null
          rate?: number | null
          distance?: number | null
          distance_miles?: number | null
          rpm?: number | null
          customer_id?: string | null
          dispatcher_id?: string | null
          special_instructions?: string | null
          appointment_number?: string | null
          pdf_reference?: string | null
          created_by: string
          assigned_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          load_number?: string
          status?:
            | "new"
            | "assigned"
            | "accepted"
            | "refused"
            | "in_progress"
            | "completed"
            | "cancelled"
            | "other_archived"
          pickup_date?: string | null
          delivery_date?: string | null
          pickup_address?: string | null
          pickup_city?: string | null
          pickup_state?: string | null
          pickup_zip?: string | null
          delivery_address?: string | null
          delivery_city?: string | null
          delivery_state?: string | null
          delivery_zip?: string | null
          commodity?: string | null
          weight?: number | null
          pieces?: number | null
          equipment_type?: string | null
          rate?: number | null
          distance?: number | null
          distance_miles?: number | null
          rpm?: number | null
          customer_id?: string | null
          dispatcher_id?: string | null
          special_instructions?: string | null
          appointment_number?: string | null
          pdf_reference?: string | null
          created_by?: string
          assigned_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      drivers: {
        Row: {
          id: string
          company_id: string
          name: string
          phone: string | null
          email: string | null
          license_number: string | null
          equipment_type: string | null
          status: "available" | "booked" | "out_of_service" | "on_vacation"
          notes: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          name: string
          phone?: string | null
          email?: string | null
          license_number?: string | null
          equipment_type?: string | null
          status?: "available" | "booked" | "out_of_service" | "on_vacation"
          notes?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          name?: string
          phone?: string | null
          email?: string | null
          license_number?: string | null
          equipment_type?: string | null
          status?: "available" | "booked" | "out_of_service" | "on_vacation"
          notes?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      customers: {
        Row: {
          id: string
          company_id: string
          name: string
          contact_name: string | null
          email: string | null
          phone: string | null
          address: string | null
          city: string | null
          state: string | null
          zip: string | null
          payment_terms: number | null
          credit_limit: number | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          name: string
          contact_name?: string | null
          email?: string | null
          phone?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          zip?: string | null
          payment_terms?: number | null
          credit_limit?: number | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          name?: string
          contact_name?: string | null
          email?: string | null
          phone?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          zip?: string | null
          payment_terms?: number | null
          credit_limit?: number | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      load_drivers: {
        Row: {
          id: string
          load_id: string
          driver_id: string
          assigned_at: string
          status: "assigned" | "accepted" | "refused" | "completed"
          is_primary: boolean
          assigned_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          load_id: string
          driver_id: string
          assigned_at?: string
          status?: "assigned" | "accepted" | "refused" | "completed"
          is_primary?: boolean
          assigned_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          load_id?: string
          driver_id?: string
          assigned_at?: string
          status?: "assigned" | "accepted" | "refused" | "completed"
          is_primary?: boolean
          assigned_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      assignment_history: {
        Row: {
          id: string
          load_id: string
          driver_id: string
          assigned_by: string
          assignment_type: "initial" | "reassignment" | "unassignment"
          previous_driver_id: string | null
          reason: string | null
          assigned_at: string
          created_at: string
        }
        Insert: {
          id?: string
          load_id: string
          driver_id: string
          assigned_by: string
          assignment_type: "initial" | "reassignment" | "unassignment"
          previous_driver_id?: string | null
          reason?: string | null
          assigned_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          load_id?: string
          driver_id?: string
          assigned_by?: string
          assignment_type?: "initial" | "reassignment" | "unassignment"
          previous_driver_id?: string | null
          reason?: string | null
          assigned_at?: string
          created_at?: string
        }
      }
      load_documents: {
        Row: {
          id: string
          load_id: string
          document_type: string
          file_name: string
          file_url: string
          file_size: number | null
          uploaded_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          load_id: string
          document_type: string
          file_name: string
          file_url: string
          file_size?: number | null
          uploaded_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          load_id?: string
          document_type?: string
          file_name?: string
          file_url?: string
          file_size?: number | null
          uploaded_by?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      dispatcher_performance: {
        Row: {
          dispatcher_id: string
          dispatcher_name: string
          dispatcher_email: string
          total_loads_created: number
          total_assignments_made: number
          completed_loads: number
          cancelled_loads: number
          reassignments_made: number
          completion_rate: number
          last_load_created: string | null
          last_assignment_made: string | null
        }
      }
    }
  }
}

// Type helpers
export type Tables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Row"]
export type Views<T extends keyof Database["public"]["Views"]> = Database["public"]["Views"][T]["Row"]
export type InsertTables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Insert"]
export type UpdateTables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Update"]

// Specific types for common use
export type Company = Tables<"companies">
export type User = Tables<"users">
export type Driver = Tables<"drivers">
export type Load = Tables<"loads">
export type Customer = Tables<"customers">
export type LoadDriver = Tables<"load_drivers">
export type LoadDocument = Tables<"load_documents">
export type AssignmentHistory = Tables<"assignment_history">
export type DispatcherPerformance = Views<"dispatcher_performance">

// Insert types
export type CompanyInsert = InsertTables<"companies">
export type UserInsert = InsertTables<"users">
export type DriverInsert = InsertTables<"drivers">
export type LoadInsert = InsertTables<"loads">
export type CustomerInsert = InsertTables<"customers">
export type LoadDriverInsert = InsertTables<"load_drivers">
export type LoadDocumentInsert = InsertTables<"load_documents">
export type AssignmentHistoryInsert = InsertTables<"assignment_history">

// Update types
export type CompanyUpdate = UpdateTables<"companies">
export type UserUpdate = UpdateTables<"users">
export type DriverUpdate = UpdateTables<"drivers">
export type LoadUpdate = UpdateTables<"loads">
export type CustomerUpdate = UpdateTables<"customers">
export type LoadDriverUpdate = UpdateTables<"load_drivers">
export type LoadDocumentUpdate = UpdateTables<"load_documents">
export type AssignmentHistoryUpdate = UpdateTables<"assignment_history">

// Status enums for better type safety
export type LoadStatus = Load["status"]
export type DriverStatus = Driver["status"]
export type UserRole = User["role"]
export type LoadDriverStatus = LoadDriver["status"]
export type AssignmentType = AssignmentHistory["assignment_type"]
