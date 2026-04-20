'use client';

import React, { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Gem, Briefcase, Users, LayoutDashboard, Eye, EyeOff, Loader2 } from 'lucide-react';
import { login } from '@/actions/auth';
import { toast } from 'sonner';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['employee', 'manager']),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [showPass, setShowPass] = useState(false);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      role: 'employee',
      email: '',
      password: '',
    },
  });

  const selectedRole = watch('role');

  const onSubmit = (data: LoginForm) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append('email', data.email);
      formData.append('password', data.password);
      formData.append('role', data.role);

      const result = await login(formData);
      if (result?.error) {
        toast.error(result.error);
      }
    });
  };

  return (
    <div className="min-h-screen flex text-brand-text bg-brand-bg relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute w-[700px] h-[700px] bg-brand-purple/20 rounded-full blur-[120px] -top-64 -left-64 pointer-events-none" />
      <div className="absolute w-[500px] h-[500px] bg-brand-teal/20 rounded-full blur-[120px] -bottom-48 -right-48 pointer-events-none" />

      {/* Left Panel - Branding */}
      <div className="hidden lg:flex flex-col flex-1 p-12 relative z-10">
        <div className="flex items-center gap-3 text-2xl font-semibold mb-24">
          <div className="p-2 bg-gradient-to-br from-brand-purple to-brand-teal rounded-xl">
            <Gem className="w-6 h-6 text-white" />
          </div>
          SkillSync
        </div>

        <div className="max-w-lg mt-auto mb-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-surface border border-brand-border text-sm mb-6">
            <span className="w-2 h-2 rounded-full bg-brand-teal animate-pulse" />
            Internal Resource & Skill Platform
          </div>
          <h1 className="text-5xl font-bold mb-6 leading-tight">
            Power your team's <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-purple to-brand-aqua">
              growth journey.
            </span>
          </h1>
          <p className="text-brand-muted text-lg mb-12 leading-relaxed">
            Map talent, allocate resources intelligently, and get real-time visibility into every skill across your organization.
          </p>

          <div className="space-y-6">
            {[
              { icon: Briefcase, title: 'Project Management', sub: 'Track and manage all ongoing tasks' },
              { icon: Users, title: 'Team Intelligence', sub: 'Skill mapping & talent allocation' },
              { icon: LayoutDashboard, title: 'Live Analytics', sub: 'Real-time performance insights' },
            ].map((Feature, i) => (
              <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-brand-surface/50 border border-brand-border/50">
                <div className="p-3 bg-brand-surface rounded-xl text-brand-purple">
                  <Feature.icon className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-semibold">{Feature.title}</div>
                  <div className="text-brand-muted text-sm">{Feature.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-md p-8 rounded-3xl bg-brand-bg/60 backdrop-blur-xl border border-brand-border shadow-2xl">
          
          {/* Role Switcher */}
          <div className="flex p-1 bg-brand-surface rounded-xl mb-8">
            <button
              type="button"
              onClick={() => setValue('role', 'employee')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all ${
                selectedRole === 'employee' ? 'bg-brand-purple text-white shadow-lg' : 'text-brand-muted hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" /> Employee
            </button>
            <button
              type="button"
              onClick={() => setValue('role', 'manager')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all ${
                selectedRole === 'manager' ? 'bg-brand-teal text-white shadow-lg' : 'text-brand-muted hover:text-white'
              }`}
            >
              <Briefcase className="w-4 h-4" /> Manager
            </button>
          </div>

          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold mb-2">Welcome back</h2>
            <p className="text-brand-muted">Sign in to your {selectedRole === 'manager' ? 'management' : 'employee'} account</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-brand-muted mb-2">Email Address</label>
              <div className="relative">
                <input
                  {...register('email')}
                  type="email"
                  className="w-full pl-4 pr-4 py-3 bg-brand-surface border border-brand-border rounded-xl focus:outline-none focus:border-brand-purple focus:ring-1 focus:ring-brand-purple transition-colors placeholder:text-brand-muted"
                  placeholder={selectedRole === 'manager' ? 'manager@company.com' : 'employee@company.com'}
                />
              </div>
              {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-brand-muted">Password</label>
              </div>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPass ? 'text' : 'password'}
                  className="w-full pl-4 pr-12 py-3 bg-brand-surface border border-brand-border rounded-xl focus:outline-none focus:border-brand-purple focus:ring-1 focus:ring-brand-purple transition-colors placeholder:text-brand-muted"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-muted hover:text-white transition-colors"
                >
                  {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isPending}
              className={`w-full py-3.5 rounded-xl font-medium transition-all flex items-center justify-center gap-2
                ${selectedRole === 'manager' 
                  ? 'bg-gradient-to-r from-brand-teal to-brand-aqua hover:shadow-[0_0_20px_rgba(45,212,191,0.4)]' 
                  : 'bg-gradient-to-r from-brand-purple to-brand-violet hover:shadow-[0_0_20px_rgba(124,58,237,0.4)]'
                } disabled:opacity-70 text-white`}
            >
              {isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Signing in...
                </>
              ) : (
                <>Sign in as {selectedRole === 'manager' ? 'Manager' : 'Employee'}</>
              )}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
