import { z } from 'zod';

export const signupSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().trim().toLowerCase().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Confirm password must be at least 8 characters'),
  department: z.string().min(1, 'Department is required'),
  role: z.enum(['employee', 'manager']),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"], // path of error
});

export type SignupFormValues = z.infer<typeof signupSchema>;
