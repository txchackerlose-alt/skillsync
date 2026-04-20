import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { FileText, Mail, Search } from 'lucide-react';

export default async function ManagerEmployeesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/');

  // Fetch all employees with their skills and resumes
  const { data: employees } = await supabase
    .from('profiles')
    .select(`
      id,
      name,
      dept,
      email,
      employee_skills(skill),
      resumes(file_url, file_name)
    `)
    .eq('role', 'employee')
    .order('name');

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold mb-2">Team Members</h2>
          <p className="text-brand-muted">View all employees, their skillsets, and resumes.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {employees?.map((emp: any) => {
          const skills = emp.employee_skills?.map((es: any) => es.skill) || [];
          const resume = emp.resumes?.[0]; // Get latest resume

          return (
            <div key={emp.id} className="p-6 rounded-2xl bg-brand-surface border border-brand-border space-y-4">
              <div className="flex items-center gap-4 border-b border-brand-border pb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-purple to-brand-teal flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  {(emp.name || '?').charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-bold text-lg">{emp.name || 'Unnamed Employee'}</h4>
                  <div className="text-sm text-brand-teal">{emp.dept || 'No department'}</div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-brand-muted text-sm">
                <Mail className="w-4 h-4" />
                <a href={`mailto:${emp.email}`} className="hover:text-brand-text transition-colors">{emp.email}</a>
              </div>

              <div>
                <div className="text-sm font-semibold text-brand-muted mb-2 uppercase tracking-wider">Skills</div>
                {skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill: string, i: number) => (
                      <span key={i} className="px-2 py-1 text-xs rounded-lg bg-brand-bg border border-brand-border text-brand-text">
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-brand-muted italic">No skills listed</div>
                )}
              </div>

              <div className="pt-4 border-t border-brand-border">
                {resume ? (
                  <a
                    href={resume.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 w-full rounded-xl bg-brand-bg border border-brand-border hover:border-brand-purple hover:text-brand-purple transition-all text-sm font-medium justify-center"
                  >
                    <FileText className="w-4 h-4" /> View Resume
                  </a>
                ) : (
                  <div className="flex items-center justify-center gap-2 px-4 py-2 w-full rounded-xl bg-brand-bg border border-brand-border text-brand-muted text-sm font-medium">
                    No Resume Uploaded
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {employees?.length === 0 && (
          <div className="col-span-full text-center p-12 border border-dashed border-brand-border rounded-2xl text-brand-muted">
            No employees found.
          </div>
        )}
      </div>
    </div>
  );
}
