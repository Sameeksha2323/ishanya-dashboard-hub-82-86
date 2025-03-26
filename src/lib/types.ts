
export interface Task {
  task_id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  category: string;
  stage: string;
  due_date: string;
  student_id: number;
  program_id: number;
  educator_employee_id: number;
  feedback: string;
  created_at?: string;
}
