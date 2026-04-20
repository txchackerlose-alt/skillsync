export interface Profile {
  id: string;
  name: string;
  role: 'manager' | 'employee';
  email: string;
  dept?: string;
  bio?: string;
  created_at: string;
}

export type TaskStatus =
  | 'Not Started'
  | 'In Progress'
  | 'Submitted for Review'
  | 'Completed'
  | 'Rejected'
  | 'Overdue';

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Task {
  id: number;
  title: string;
  description?: string;
  priority: TaskPriority;
  deadline?: string;
  required_skills?: string[];
  status: TaskStatus;
  progress: number;
  review_status?: 'Submitted' | 'Approved' | 'Rejected';
  manager_feedback?: string;
  completed_at?: string;
  reviewed_at?: string;
  created_by: string;
  created_at: string;
  updated_at?: string;
}

export interface TaskAssignment {
  task_id: number;
  employee_id: string;
  assigned_at: string;
  profiles?: Profile;
  tasks?: Task;
}

export interface TaskComment {
  id: number;
  task_id: number;
  user_id: string;
  comment: string;
  created_at: string;
  profiles?: Profile;
}

export interface TaskFile {
  id: number;
  task_id: number;
  uploaded_by: string;
  file_url: string;
  file_name: string;
  created_at: string;
  profiles?: Profile;
}

export interface TaskUpdate {
  id: number;
  task_id: number;
  progress: number;
  note?: string;
  created_by: string;
  created_at: string;
  profiles?: Profile;
}

export interface TaskWithDetails extends Task {
  task_assignments?: TaskAssignment[];
  task_comments?: TaskComment[];
  task_files?: TaskFile[];
  task_updates?: TaskUpdate[];
}
