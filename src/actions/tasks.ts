'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// ── Helpers ────────────────────────────────────────────
function revalidateTaskPaths(taskId?: number) {
  revalidatePath('/manager');
  revalidatePath('/manager/tasks');
  revalidatePath('/employee');
  revalidatePath('/employee/tasks');
  if (taskId) {
    revalidatePath(`/manager/tasks/${taskId}`);
    revalidatePath(`/employee/tasks/${taskId}`);
  }
}

// ── Manager: Create task ────────────────────────────────
export async function createTask(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const priority = formData.get('priority') as string;
  const deadline = formData.get('deadline') as string;
  const requiredSkillsStr = formData.get('requiredSkills') as string;
  const assigneeId = formData.get('assigneeId') as string;

  const requiredSkills = requiredSkillsStr
    ? requiredSkillsStr.split(',').map(s => s.trim()).filter(Boolean)
    : [];

  const { data: task, error: taskError } = await supabase
    .from('tasks')
    .insert({
      title,
      description,
      priority,
      deadline: deadline || null,
      required_skills: requiredSkills,
      status: 'Not Started',
      progress: 0,
      created_by: user.id,
    })
    .select()
    .single();

  if (taskError || !task) {
    return { error: taskError?.message || 'Failed to create task' };
  }

  if (assigneeId) {
    const { error: assignError } = await supabase
      .from('task_assignments')
      .insert({ task_id: task.id, employee_id: assigneeId });
    if (assignError) {
      return { error: 'Task created but failed to assign: ' + assignError.message };
    }
    await supabase.from('notifications').insert({
      user_id: assigneeId,
      message: `You have been assigned a new task: "${title}"`,
    });
  }

  revalidateTaskPaths(task.id);
  return { success: true, taskId: task.id };
}

// ── Manager: Delete task ────────────────────────────────
export async function deleteTask(taskId: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  // Delete associated files from storage first
  const { data: filesList } = await supabase.storage.from('task-files').list('', {
    search: `task-${taskId}-`
  });
  
  if (filesList && filesList.length > 0) {
    const filePaths = filesList.map(f => f.name);
    await supabase.storage.from('task-files').remove(filePaths);
  }

  const { error } = await supabase.from('tasks').delete().eq('id', taskId);
  if (error) return { error: error.message };

  revalidateTaskPaths();
  return { success: true };
}

// ── Manager: Approve task ───────────────────────────────
export async function approveTask(taskId: number, feedback: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { error } = await supabase
    .from('tasks')
    .update({
      status: 'Completed',
      review_status: 'Approved',
      manager_feedback: feedback,
      reviewed_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
    })
    .eq('id', taskId);

  if (error) return { error: error.message };

  // Notify employee
  const { data: assignment } = await supabase
    .from('task_assignments')
    .select('employee_id, tasks(title)')
    .eq('task_id', taskId)
    .single();

  if (assignment) {
    await supabase.from('notifications').insert({
      user_id: assignment.employee_id,
      message: `Your task has been approved! Great work.`,
    });
  }

  revalidateTaskPaths(taskId);
  return { success: true };
}

// ── Manager: Reject task ────────────────────────────────
export async function rejectTask(taskId: number, feedback: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { error } = await supabase
    .from('tasks')
    .update({
      status: 'Rejected',
      review_status: 'Rejected',
      manager_feedback: feedback,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', taskId);

  if (error) return { error: error.message };

  const { data: assignment } = await supabase
    .from('task_assignments')
    .select('employee_id')
    .eq('task_id', taskId)
    .single();

  if (assignment) {
    await supabase.from('notifications').insert({
      user_id: assignment.employee_id,
      message: `Your task submission has been rejected. Please review the feedback and resubmit.`,
    });
  }

  revalidateTaskPaths(taskId);
  return { success: true };
}

// ── Manager: Update task ────────────────────────────────
export async function updateTask(taskId: number, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const priority = formData.get('priority') as string;
  const deadline = formData.get('deadline') as string;
  const status = formData.get('status') as string;
  const requiredSkillsStr = formData.get('requiredSkills') as string;
  const assigneeId = formData.get('assigneeId') as string | null;

  const requiredSkills = requiredSkillsStr
    ? requiredSkillsStr.split(',').map(s => s.trim()).filter(Boolean)
    : [];

  const updatePayload: any = { 
    title, 
    description, 
    priority, 
    deadline: deadline || null, 
    required_skills: requiredSkills,
    updated_at: new Date().toISOString() 
  };
  
  if (status) updatePayload.status = status;

  const { error } = await supabase
    .from('tasks')
    .update(updatePayload)
    .eq('id', taskId);

  if (error) return { error: error.message };

  if (assigneeId !== null) {
    // Delete existing assignments for this task
    await supabase.from('task_assignments').delete().eq('task_id', taskId);
    
    // Assign to new employee if an ID was provided
    if (assigneeId) {
      await supabase.from('task_assignments').insert({ task_id: taskId, employee_id: assigneeId });
      
      // Notify the new employee
      await supabase.from('notifications').insert({
        user_id: assigneeId,
        message: `You have been assigned to a task: "${title}"`,
      });
    }
  }

  revalidateTaskPaths(taskId);
  return { success: true };
}

// ── Employee: Start task ────────────────────────────────
export async function startTask(taskId: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { error } = await supabase
    .from('tasks')
    .update({ status: 'In Progress', updated_at: new Date().toISOString() })
    .eq('id', taskId);

  if (error) return { error: error.message };

  revalidateTaskPaths(taskId);
  return { success: true };
}

// ── Employee: Update progress ───────────────────────────
export async function updateTaskProgress(taskId: number, progress: number, note: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { error: taskError } = await supabase
    .from('tasks')
    .update({ progress, updated_at: new Date().toISOString() })
    .eq('id', taskId);

  if (taskError) return { error: taskError.message };

  // Log the update in task_updates
  await supabase.from('task_updates').insert({
    task_id: taskId,
    progress,
    note: note || null,
    created_by: user.id,
  });

  revalidateTaskPaths(taskId);
  return { success: true };
}

// ── Employee: Submit for review ─────────────────────────
export async function submitTaskForReview(taskId: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { error } = await supabase
    .from('tasks')
    .update({
      status: 'Submitted for Review',
      review_status: 'Submitted',
      progress: 100,
      updated_at: new Date().toISOString(),
    })
    .eq('id', taskId);

  if (error) return { error: error.message };

  // Notify manager(s)
  const { data: task } = await supabase
    .from('tasks')
    .select('title, created_by')
    .eq('id', taskId)
    .single();

  if (task?.created_by) {
    await supabase.from('notifications').insert({
      user_id: task.created_by,
      message: `Task "${task.title}" has been submitted for your review.`,
    });
  }

  revalidateTaskPaths(taskId);
  return { success: true };
}

// ── Both: Add comment ───────────────────────────────────
export async function addComment(taskId: number, comment: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { error } = await supabase.from('task_comments').insert({
    task_id: taskId,
    user_id: user.id,
    comment,
  });

  if (error) return { error: error.message };

  revalidatePath(`/employee/tasks/${taskId}`);
  revalidatePath(`/manager/tasks/${taskId}`);
  return { success: true };
}

// ── Employee: Upload file to task ───────────────────────
export async function uploadTaskFile(taskId: number, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const file = formData.get('file') as File;
  if (!file || file.size === 0) return { error: 'No file provided' };

  const fileExt = file.name.split('.').pop();
  const fileName = `task-${taskId}-${user.id}-${Date.now()}.${fileExt}`;

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('task-files')
    .upload(fileName, file, { upsert: false });

  if (uploadError || !uploadData) {
    return { error: 'Upload failed: ' + (uploadError?.message || 'Unknown error') };
  }

  const { data: urlData } = supabase.storage.from('task-files').getPublicUrl(fileName);

  const { error: dbError } = await supabase.from('task_files').insert({
    task_id: taskId,
    uploaded_by: user.id,
    file_url: urlData.publicUrl,
    file_name: file.name,
  });

  if (dbError) return { error: dbError.message };

  revalidatePath(`/employee/tasks/${taskId}`);
  revalidatePath(`/manager/tasks/${taskId}`);
  return { success: true };
}

// ── Old: Update task status (backwards compat) ──────────
export async function updateTaskStatus(taskId: number, newStatus: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('tasks')
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq('id', taskId);

  if (error) return { error: error.message };

  revalidateTaskPaths(taskId);
  return { success: true };
}
