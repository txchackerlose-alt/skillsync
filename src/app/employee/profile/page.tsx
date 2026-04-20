import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import EmployeeProfileForm from './EmployeeProfileForm';

export default async function EmployeeProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/');

  // Fetch profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // Fetch skills
  const { data: skills } = await supabase
    .from('employee_skills')
    .select('skill')
    .eq('employee_id', user.id);

  // Fetch resumes
  const { data: resumes } = await supabase
    .from('resumes')
    .select('*')
    .eq('employee_id', user.id)
    .order('created_at', { ascending: false });

  const initialSkills = skills?.map(s => s.skill).join(', ') || '';

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">My Profile</h2>
        <p className="text-brand-muted">Manage your personal information, skills, and resume.</p>
      </div>

      <div className="p-8 rounded-3xl bg-brand-surface border border-brand-border">
        <EmployeeProfileForm 
          profile={profile} 
          initialSkills={initialSkills}
          latestResume={resumes?.[0]} 
        />
      </div>
    </div>
  );
}
