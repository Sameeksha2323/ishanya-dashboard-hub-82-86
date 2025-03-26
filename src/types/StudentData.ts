
export interface StudentData {
  student_id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  address?: string;
  program_id?: string;
  center_id?: string;
  educator_employee_id?: string;
  dob?: string;
  gender?: string;
  // Add other fields as needed
  programs?: {
    name: string;
  };
}

export interface EducatorData {
  employee_id: string;
  name: string;
  email: string;
  phone: string;
  designation: string;
  work_location: string;
  center_id?: string;
  date_of_birth?: string;
  date_of_joining?: string;
  photo?: string;
  id?: string;
  created_at?: string;
}
