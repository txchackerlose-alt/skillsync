import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import CreateTaskForm from './CreateTaskForm';

export default async function CreateTaskPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/');

  // Fetch all employees and their skills
  const { data: employees } = await supabase
    .from('profiles')
    .select(`
      id,
      name,
      employee_skills (
        skill
      )
    `)
    .eq('role', 'employee');

  // Format data for the skill matching logic
  const formattedEmployees = employees?.map(emp => ({
    id: emp.id,
    name: emp.name,
    skills: emp.employee_skills.map((es: any) => es.skill)
  })) || [];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Create New Task</h2>
        <p className="text-brand-muted">Define the task and let the system suggest the best employee based on required skills.</p>
      </div>

      <CreateTaskForm employees={formattedEmployees} />
    </div>
  );
}
