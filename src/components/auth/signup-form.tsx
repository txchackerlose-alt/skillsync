'use client';

import React, { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2, User, Mail, Building2, Lock, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { signupSchema, SignupFormValues } from '@/lib/validations/signup-schema';
import { signup } from '@/actions/auth-actions';

export default function SignupForm() {
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      department: '',
      role: 'employee',
    },
  });

  const onSubmit = (data: SignupFormValues) => {
    startTransition(async () => {
      const result = await signup(data);

      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success('Account created successfully!');
        // Redirect to employee dashboard or login page
        router.push('/employee');
        router.refresh(); // Refresh the router to pick up new session if needed
      }
    });
  };

  return (
    <div className="w-full max-w-md p-8 rounded-3xl bg-brand-bg/60 backdrop-blur-xl border border-brand-border shadow-2xl">
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-surface border border-brand-border text-xs font-medium text-brand-purple mb-4">
          Employee Signup
        </div>
        <h2 className="text-2xl font-bold mb-2 text-white">Create an Account</h2>
        <p className="text-brand-muted">Join the SkillSync platform</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium text-brand-muted mb-1.5">Full Name</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-brand-muted">
              <User className="w-5 h-5" />
            </div>
            <input
              {...register('fullName')}
              type="text"
              className="w-full pl-11 pr-4 py-3 bg-brand-surface border border-brand-border rounded-xl focus:outline-none focus:border-brand-purple focus:ring-1 focus:ring-brand-purple transition-colors placeholder:text-brand-muted/70 text-white"
              placeholder="John Doe"
            />
          </div>
          {errors.fullName && <p className="text-red-400 text-xs mt-1.5">{errors.fullName.message}</p>}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-brand-muted mb-1.5">Email Address</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-brand-muted">
              <Mail className="w-5 h-5" />
            </div>
            <input
              {...register('email')}
              type="email"
              className="w-full pl-11 pr-4 py-3 bg-brand-surface border border-brand-border rounded-xl focus:outline-none focus:border-brand-purple focus:ring-1 focus:ring-brand-purple transition-colors placeholder:text-brand-muted/70 text-white"
              placeholder="employee@company.com"
            />
          </div>
          {errors.email && <p className="text-red-400 text-xs mt-1.5">{errors.email.message}</p>}
        </div>

        {/* Department */}
        <div>
          <label className="block text-sm font-medium text-brand-muted mb-1.5">Department</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-brand-muted">
              <Building2 className="w-5 h-5" />
            </div>
            <input
              {...register('department')}
              type="text"
              className="w-full pl-11 pr-4 py-3 bg-brand-surface border border-brand-border rounded-xl focus:outline-none focus:border-brand-purple focus:ring-1 focus:ring-brand-purple transition-colors placeholder:text-brand-muted/70 text-white"
              placeholder="e.g. Engineering, Marketing"
            />
          </div>
          {errors.department && <p className="text-red-400 text-xs mt-1.5">{errors.department.message}</p>}
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-brand-muted mb-1.5">Password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-brand-muted">
              <Lock className="w-5 h-5" />
            </div>
            <input
              {...register('password')}
              type={showPass ? 'text' : 'password'}
              className="w-full pl-11 pr-12 py-3 bg-brand-surface border border-brand-border rounded-xl focus:outline-none focus:border-brand-purple focus:ring-1 focus:ring-brand-purple transition-colors placeholder:text-brand-muted/70 text-white"
              placeholder="Min. 8 characters"
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-muted hover:text-white transition-colors"
            >
              {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.password && <p className="text-red-400 text-xs mt-1.5">{errors.password.message}</p>}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-medium text-brand-muted mb-1.5">Confirm Password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-brand-muted">
              <Lock className="w-5 h-5" />
            </div>
            <input
              {...register('confirmPassword')}
              type={showConfirmPass ? 'text' : 'password'}
              className="w-full pl-11 pr-12 py-3 bg-brand-surface border border-brand-border rounded-xl focus:outline-none focus:border-brand-purple focus:ring-1 focus:ring-brand-purple transition-colors placeholder:text-brand-muted/70 text-white"
              placeholder="Confirm your password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPass(!showConfirmPass)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-muted hover:text-white transition-colors"
            >
              {showConfirmPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.confirmPassword && <p className="text-red-400 text-xs mt-1.5">{errors.confirmPassword.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full py-3.5 mt-2 rounded-xl font-medium transition-all flex items-center justify-center gap-2 bg-gradient-to-r from-brand-purple to-brand-violet hover:shadow-[0_0_20px_rgba(124,58,237,0.4)] disabled:opacity-70 text-white"
        >
          {isPending ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" /> Creating account...
            </>
          ) : (
            <>
              Sign Up <ArrowRight className="w-4 h-4 ml-1" />
            </>
          )}
        </button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-sm text-brand-muted">
          Already have an account?{' '}
          <Link href="/" className="text-brand-purple hover:text-brand-violet hover:underline font-medium transition-colors">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
