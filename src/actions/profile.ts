'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const name = formData.get('name') as string;
  const dept = formData.get('dept') as string;
  const bio  = formData.get('bio')  as string;
  const skillsStr  = formData.get('skills')  as string;
  const resumeFile = formData.get('resume')  as File | null;

  // ── 1. Update profile row ──────────────────────────
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ name, dept, bio })
    .eq('id', user.id);
  if (profileError) return { error: 'Failed to save profile: ' + profileError.message };

  // ── 2. Replace skills ──────────────────────────────
  await supabase.from('employee_skills').delete().eq('employee_id', user.id);
  if (skillsStr) {
    const skills = skillsStr.split(',').map(s => s.trim()).filter(Boolean);
    if (skills.length > 0) {
      await supabase.from('employee_skills').insert(
        skills.map(skill => ({ employee_id: user.id, skill }))
      );
    }
  }

  // ── 3. Resume upload ───────────────────────────────
  if (resumeFile && resumeFile.size > 0) {
    // Validate file type
    const allowed = ['application/pdf', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowed.includes(resumeFile.type) && !resumeFile.name.match(/\.(pdf|doc|docx)$/i)) {
      return { error: 'Only PDF, DOC, and DOCX files are allowed.' };
    }

    // Validate file size (5MB max)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (resumeFile.size > MAX_SIZE) {
      return { error: 'Resume file must be smaller than 5MB.' };
    }

    // Use a stable path per user so it auto-replaces the old file
    const fileExt = resumeFile.name.split('.').pop()?.toLowerCase() || 'pdf';
    const storagePath = `${user.id}/resume.${fileExt}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('resumes')
      .upload(storagePath, resumeFile, {
        upsert: true,         // Overwrite if exists
        contentType: resumeFile.type,
      });

    if (uploadError) {
      // Return a specific, useful error message
      if (uploadError.message?.includes('Bucket not found') || uploadError.message?.includes('not found')) {
        return {
          error: 'Storage bucket "resumes" does not exist. Please create it in your Supabase Dashboard → Storage.',
        };
      }
      return { error: 'Resume upload failed: ' + uploadError.message };
    }

    if (uploadData) {
      const { data: urlData } = supabase.storage.from('resumes').getPublicUrl(storagePath);

      // Delete any existing resume record for this employee, then insert fresh
      await supabase.from('resumes').delete().eq('employee_id', user.id);
      const { error: dbError } = await supabase.from('resumes').insert({
        employee_id: user.id,
        file_url: urlData.publicUrl,
        file_name: resumeFile.name,
      });

      if (dbError) return { error: 'Resume saved to storage but failed to record: ' + dbError.message };
    }
  }

  revalidatePath('/employee/profile');
  revalidatePath('/manager/employees');
  return { success: true };
}
