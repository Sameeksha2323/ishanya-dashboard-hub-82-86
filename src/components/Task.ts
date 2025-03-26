
// Define the Task type for use across components
export interface Task {
  task_id: string;
  title: string;
  description: string;
  status: string;
  student_id: number;
  educator_employee_id: number;
  program_id: number;
  due_date: string;
  priority: string;
  feedback: string;
  category: string;
  stage: string;
  created_at?: string;
}

export default Task;
