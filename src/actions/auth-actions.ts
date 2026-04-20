'use server';

import { createClient } from '@/lib/supabase/server';
import { signupSchema } from '@/lib/validations/signup-schema';
import { z } from 'zod';
import { redirect } from 'next/navigation';

export async function signup(formData: z.infer<typeof signupSchema>) {
  try {
    // 1. Validate the form data
    const validatedData = signupSchema.safeParse(formData);
    
    if (!validatedData.success) {
      return { error: validatedData.error.issues[0].message };
    }

    const { email, password, fullName, department, role } = validatedData.data;

    const supabase = await createClient();

    // 2. Call Supabase Auth to create the user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: fullName,
          role: role,
        },
      },
    });

    if (error) {
      return { error: error.message };
    }

    if (data.user) {
      // 3. Update the profiles table to set the department
      // The `handle_new_user` trigger automatically creates the profile row 
      // but only with name, role, and email. We update it to add dept.
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ dept: department })
        .eq('id', data.user.id);

      if (profileError) {
        console.error('Failed to update profile department:', profileError);
        // We still created the user, so we shouldn't completely fail, 
        // but it's good to log or return an error if strictly required.
      }
    }

    // Success
    return { success: true };
  } catch (error) {
    return { error: 'An unexpected error occurred during signup.' };
  }
}
