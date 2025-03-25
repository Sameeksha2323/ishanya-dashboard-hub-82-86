export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      announcements: {
        Row: {
          admin_id: string | null
          announcement: string | null
          announcement_id: number
          created_at: string | null
          title: string | null
        }
        Insert: {
          admin_id?: string | null
          announcement?: string | null
          announcement_id?: number
          created_at?: string | null
          title?: string | null
        }
        Update: {
          admin_id?: string | null
          announcement?: string | null
          announcement_id?: number
          created_at?: string | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "announcements_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      centers: {
        Row: {
          center_id: number
          created_at: string | null
          id: string
          location: string | null
          name: string
          num_of_educator: number | null
          num_of_employees: number | null
          num_of_student: number | null
        }
        Insert: {
          center_id?: number
          created_at?: string | null
          id?: string
          location?: string | null
          name: string
          num_of_educator?: number | null
          num_of_employees?: number | null
          num_of_student?: number | null
        }
        Update: {
          center_id?: number
          created_at?: string | null
          id?: string
          location?: string | null
          name?: string
          num_of_educator?: number | null
          num_of_employees?: number | null
          num_of_student?: number | null
        }
        Relationships: []
      }
      discussion_messages: {
        Row: {
          created_at: string
          id: string
          message: string
          sender_id: string
          sender_name: string
          sender_role: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          sender_id: string
          sender_name: string
          sender_role: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          sender_id?: string
          sender_name?: string
          sender_role?: string
        }
        Relationships: []
      }
      educators: {
        Row: {
          center_id: number
          created_at: string | null
          date_of_birth: string
          date_of_joining: string
          designation: string
          email: string
          employee_id: number
          id: string
          name: string
          phone: string
          photo: string | null
          work_location: string
        }
        Insert: {
          center_id: number
          created_at?: string | null
          date_of_birth: string
          date_of_joining: string
          designation: string
          email: string
          employee_id: number
          id?: string
          name: string
          phone: string
          photo?: string | null
          work_location: string
        }
        Update: {
          center_id?: number
          created_at?: string | null
          date_of_birth?: string
          date_of_joining?: string
          designation?: string
          email?: string
          employee_id?: number
          id?: string
          name?: string
          phone?: string
          photo?: string | null
          work_location?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_educators_center"
            columns: ["center_id"]
            isOneToOne: false
            referencedRelation: "centers"
            referencedColumns: ["center_id"]
          },
          {
            foreignKeyName: "fk_educators_employee"
            columns: ["employee_id"]
            isOneToOne: true
            referencedRelation: "employees"
            referencedColumns: ["employee_id"]
          },
        ]
      }
      employee_attendance: {
        Row: {
          attendance: boolean | null
          date: string
          employee_id: number
        }
        Insert: {
          attendance?: boolean | null
          date: string
          employee_id: number
        }
        Update: {
          attendance?: boolean | null
          date?: string
          employee_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_attendance_employee"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["employee_id"]
          },
        ]
      }
      employee_payroll: {
        Row: {
          current_salary: number | null
          employee_id: number
          last_paid: string | null
        }
        Insert: {
          current_salary?: number | null
          employee_id: number
          last_paid?: string | null
        }
        Update: {
          current_salary?: number | null
          employee_id?: number
          last_paid?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_payroll_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["employee_id"]
          },
        ]
      }
      employees: {
        Row: {
          blood_group: string | null
          center_id: number
          created_at: string | null
          date_of_birth: string
          date_of_joining: string
          date_of_leaving: string | null
          department: string
          designation: string
          email: string
          emergency_contact: string
          emergency_contact_name: string
          employee_id: number
          employment_type: string
          gender: string
          id: string
          LOR: string | null
          name: string
          password: string
          phone: string
          program_id: number | null
          status: string
          work_location: string | null
        }
        Insert: {
          blood_group?: string | null
          center_id: number
          created_at?: string | null
          date_of_birth: string
          date_of_joining: string
          date_of_leaving?: string | null
          department: string
          designation: string
          email: string
          emergency_contact: string
          emergency_contact_name: string
          employee_id?: number
          employment_type: string
          gender: string
          id?: string
          LOR?: string | null
          name: string
          password?: string
          phone: string
          program_id?: number | null
          status: string
          work_location?: string | null
        }
        Update: {
          blood_group?: string | null
          center_id?: number
          created_at?: string | null
          date_of_birth?: string
          date_of_joining?: string
          date_of_leaving?: string | null
          department?: string
          designation?: string
          email?: string
          emergency_contact?: string
          emergency_contact_name?: string
          employee_id?: number
          employment_type?: string
          gender?: string
          id?: string
          LOR?: string | null
          name?: string
          password?: string
          phone?: string
          program_id?: number | null
          status?: string
          work_location?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_employees_center"
            columns: ["center_id"]
            isOneToOne: false
            referencedRelation: "centers"
            referencedColumns: ["center_id"]
          },
          {
            foreignKeyName: "fk_employees_program_center"
            columns: ["program_id", "center_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["program_id", "center_id"]
          },
        ]
      }
      general_reporting: {
        Row: {
          any_behavioral_issues: string | null
          assistance_required: string | null
          educator_employee_id: number
          parental_support: string | null
          preparedness: string | null
          program_id: number
          punctuality: string | null
          quarter: string
          student_id: number
        }
        Insert: {
          any_behavioral_issues?: string | null
          assistance_required?: string | null
          educator_employee_id: number
          parental_support?: string | null
          preparedness?: string | null
          program_id: number
          punctuality?: string | null
          quarter: string
          student_id: number
        }
        Update: {
          any_behavioral_issues?: string | null
          assistance_required?: string | null
          educator_employee_id?: number
          parental_support?: string | null
          preparedness?: string | null
          program_id?: number
          punctuality?: string | null
          quarter?: string
          student_id?: number
        }
        Relationships: []
      }
      goals_tasks: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          due_date: string
          educator_employee_id: number
          feedback: string | null
          priority: string
          program_id: number
          stage: string | null
          status: string
          student_id: number
          task_id: string
          title: string | null
        }
        Insert: {
          category?: string | null
          created_at: string
          description?: string | null
          due_date: string
          educator_employee_id: number
          feedback?: string | null
          priority?: string
          program_id: number
          stage?: string | null
          status?: string
          student_id: number
          task_id: string
          title?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          due_date?: string
          educator_employee_id?: number
          feedback?: string | null
          priority?: string
          program_id?: number
          stage?: string | null
          status?: string
          student_id?: number
          task_id?: string
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_goals_tasks_student"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "goals_tasks_educator_employee_id_fkey"
            columns: ["educator_employee_id"]
            isOneToOne: false
            referencedRelation: "educators"
            referencedColumns: ["employee_id"]
          },
        ]
      }
      notifications: {
        Row: {
          announcement_id: number | null
          created_at: string | null
          id: string
          is_read: boolean | null
          user_id: string
        }
        Insert: {
          announcement_id?: number | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          user_id: string
        }
        Update: {
          announcement_id?: number | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_announcement_id_fkey"
            columns: ["announcement_id"]
            isOneToOne: false
            referencedRelation: "announcements"
            referencedColumns: ["announcement_id"]
          },
        ]
      }
      parents: {
        Row: {
          email: string
          feedback: string | null
          id: number
          password: string
          student_id: number
        }
        Insert: {
          email: string
          feedback?: string | null
          id?: number
          password: string
          student_id: number
        }
        Update: {
          email?: string
          feedback?: string | null
          id?: number
          password?: string
          student_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_parents_students"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["student_id"]
          },
        ]
      }
      performance_records: {
        Row: {
          "1_description": string | null
          "1_score": number | null
          "10_description": string | null
          "10_score": number | null
          "11_description": string | null
          "11_score": number | null
          "12_description": string | null
          "12_score": number | null
          "13_description": string | null
          "13_score": number | null
          "14_description": string | null
          "14_score": number | null
          "15_description": string | null
          "15_score": number | null
          "16_description": string | null
          "16_score": number | null
          "2_description": string | null
          "2_score": number | null
          "3_description": string | null
          "3_score": number | null
          "4_description": string | null
          "4_score": number | null
          "5_description": string | null
          "5_score": number | null
          "6_description": string | null
          "6_score": number | null
          "7_description": string | null
          "7_score": number | null
          "8_description": string | null
          "8_score": number | null
          "9_description": string | null
          "9_score": number | null
          area_of_development: string
          description: string | null
          educator_employee_id: number
          id: string
          program_id: number
          quarter: string
          skill_area: string | null
          student_id: number
        }
        Insert: {
          "1_description"?: string | null
          "1_score"?: number | null
          "10_description"?: string | null
          "10_score"?: number | null
          "11_description"?: string | null
          "11_score"?: number | null
          "12_description"?: string | null
          "12_score"?: number | null
          "13_description"?: string | null
          "13_score"?: number | null
          "14_description"?: string | null
          "14_score"?: number | null
          "15_description"?: string | null
          "15_score"?: number | null
          "16_description"?: string | null
          "16_score"?: number | null
          "2_description"?: string | null
          "2_score"?: number | null
          "3_description"?: string | null
          "3_score"?: number | null
          "4_description"?: string | null
          "4_score"?: number | null
          "5_description"?: string | null
          "5_score"?: number | null
          "6_description"?: string | null
          "6_score"?: number | null
          "7_description"?: string | null
          "7_score"?: number | null
          "8_description"?: string | null
          "8_score"?: number | null
          "9_description"?: string | null
          "9_score"?: number | null
          area_of_development: string
          description?: string | null
          educator_employee_id: number
          id?: string
          program_id: number
          quarter: string
          skill_area?: string | null
          student_id: number
        }
        Update: {
          "1_description"?: string | null
          "1_score"?: number | null
          "10_description"?: string | null
          "10_score"?: number | null
          "11_description"?: string | null
          "11_score"?: number | null
          "12_description"?: string | null
          "12_score"?: number | null
          "13_description"?: string | null
          "13_score"?: number | null
          "14_description"?: string | null
          "14_score"?: number | null
          "15_description"?: string | null
          "15_score"?: number | null
          "16_description"?: string | null
          "16_score"?: number | null
          "2_description"?: string | null
          "2_score"?: number | null
          "3_description"?: string | null
          "3_score"?: number | null
          "4_description"?: string | null
          "4_score"?: number | null
          "5_description"?: string | null
          "5_score"?: number | null
          "6_description"?: string | null
          "6_score"?: number | null
          "7_description"?: string | null
          "7_score"?: number | null
          "8_description"?: string | null
          "8_score"?: number | null
          "9_description"?: string | null
          "9_score"?: number | null
          area_of_development?: string
          description?: string | null
          educator_employee_id?: number
          id?: string
          program_id?: number
          quarter?: string
          skill_area?: string | null
          student_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_performance_student"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["student_id"]
          },
        ]
      }
      programs: {
        Row: {
          center_id: number
          created_at: string | null
          end_date: string | null
          id: string
          name: string
          num_of_educator: number | null
          num_of_student: number | null
          program_id: number
          start_date: string | null
        }
        Insert: {
          center_id: number
          created_at?: string | null
          end_date?: string | null
          id?: string
          name: string
          num_of_educator?: number | null
          num_of_student?: number | null
          program_id?: number
          start_date?: string | null
        }
        Update: {
          center_id?: number
          created_at?: string | null
          end_date?: string | null
          id?: string
          name?: string
          num_of_educator?: number | null
          num_of_student?: number | null
          program_id?: number
          start_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_programs_center"
            columns: ["center_id"]
            isOneToOne: false
            referencedRelation: "centers"
            referencedColumns: ["center_id"]
          },
        ]
      }
      reports: {
        Row: {
          educator_employee_id: number
          program_id: number
          quarter: string
          student_id: number
          url: string | null
        }
        Insert: {
          educator_employee_id: number
          program_id: number
          quarter: string
          student_id: number
          url?: string | null
        }
        Update: {
          educator_employee_id?: number
          program_id?: number
          quarter?: string
          student_id?: number
          url?: string | null
        }
        Relationships: []
      }
      student_attendance: {
        Row: {
          attendance: boolean | null
          date: string
          program_id: number
          student_id: number
        }
        Insert: {
          attendance?: boolean | null
          date: string
          program_id: number
          student_id: number
        }
        Update: {
          attendance?: boolean | null
          date?: string
          program_id?: number
          student_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_attendance_student"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["student_id"]
          },
        ]
      }
      students: {
        Row: {
          address: string | null
          allergies: string | null
          alt_contact_number: string | null
          blood_group: string | null
          center_id: number
          comments: string | null
          comorbidity: string | null
          contact_number: string
          created_at: string | null
          days_of_week: string[] | null
          dob: string
          educator_employee_id: number
          enrollment_year: number
          fathers_name: string | null
          first_name: string
          gender: string
          id: string
          last_name: string
          mothers_name: string | null
          number_of_sessions: number | null
          parents_email: string | null
          photo: string | null
          primary_diagnosis: string | null
          program_2_id: number | null
          program_id: number
          secondary_educator_employee_id: number | null
          session_type: string | null
          status: string
          strengths: string | null
          student_email: string
          student_id: number
          timings: string | null
          transport: string | null
          udid: string | null
          weakness: string | null
        }
        Insert: {
          address?: string | null
          allergies?: string | null
          alt_contact_number?: string | null
          blood_group?: string | null
          center_id: number
          comments?: string | null
          comorbidity?: string | null
          contact_number: string
          created_at?: string | null
          days_of_week?: string[] | null
          dob: string
          educator_employee_id: number
          enrollment_year: number
          fathers_name?: string | null
          first_name: string
          gender: string
          id?: string
          last_name: string
          mothers_name?: string | null
          number_of_sessions?: number | null
          parents_email?: string | null
          photo?: string | null
          primary_diagnosis?: string | null
          program_2_id?: number | null
          program_id: number
          secondary_educator_employee_id?: number | null
          session_type?: string | null
          status: string
          strengths?: string | null
          student_email: string
          student_id: number
          timings?: string | null
          transport?: string | null
          udid?: string | null
          weakness?: string | null
        }
        Update: {
          address?: string | null
          allergies?: string | null
          alt_contact_number?: string | null
          blood_group?: string | null
          center_id?: number
          comments?: string | null
          comorbidity?: string | null
          contact_number?: string
          created_at?: string | null
          days_of_week?: string[] | null
          dob?: string
          educator_employee_id?: number
          enrollment_year?: number
          fathers_name?: string | null
          first_name?: string
          gender?: string
          id?: string
          last_name?: string
          mothers_name?: string | null
          number_of_sessions?: number | null
          parents_email?: string | null
          photo?: string | null
          primary_diagnosis?: string | null
          program_2_id?: number | null
          program_id?: number
          secondary_educator_employee_id?: number | null
          session_type?: string | null
          status?: string
          strengths?: string | null
          student_email?: string
          student_id?: number
          timings?: string | null
          transport?: string | null
          udid?: string | null
          weakness?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_students_educator"
            columns: ["educator_employee_id"]
            isOneToOne: false
            referencedRelation: "educators"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "fk_students_program_center"
            columns: ["program_id", "center_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["program_id", "center_id"]
          },
          {
            foreignKeyName: "fk_students_secondary_educator"
            columns: ["secondary_educator_employee_id"]
            isOneToOne: false
            referencedRelation: "educators"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "students_center_id_fkey"
            columns: ["center_id"]
            isOneToOne: false
            referencedRelation: "centers"
            referencedColumns: ["center_id"]
          },
        ]
      }
      voice_sessions: {
        Row: {
          collected_data: Json | null
          created_at: string | null
          current_field: string | null
          id: string
          status: string | null
          table_name: string
          updated_at: string | null
        }
        Insert: {
          collected_data?: Json | null
          created_at?: string | null
          current_field?: string | null
          id?: string
          status?: string | null
          table_name: string
          updated_at?: string | null
        }
        Update: {
          collected_data?: Json | null
          created_at?: string | null
          current_field?: string | null
          id?: string
          status?: string | null
          table_name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      webdata: {
        Row: {
          created_at: string | null
          transaction_id: number
          transaction_name: string
        }
        Insert: {
          created_at?: string | null
          transaction_id?: number
          transaction_name: string
        }
        Update: {
          created_at?: string | null
          transaction_id?: number
          transaction_name?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      run_sql: {
        Args: {
          query: string
        }
        Returns: {
          result: Json
        }[]
      }
    }
    Enums: {
      tasks_stage: "To Do" | "In Progress" | "Review" | "Done"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
