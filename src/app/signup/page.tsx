import React from 'react';
import { Gem, Briefcase, Users, LayoutDashboard } from 'lucide-react';
import SignupForm from '@/components/auth/signup-form';

export const metadata = {
  title: 'Employee Signup | SkillSync',
  description: 'Create an employee account on SkillSync',
};

export default function SignupPage() {
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
            Start your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-purple to-brand-aqua">
              growth journey.
            </span>
          </h1>
          <p className="text-brand-muted text-lg mb-12 leading-relaxed">
            Join the platform to track your skills, collaborate on internal projects, and receive continuous feedback.
          </p>

          <div className="space-y-6">
            {[
              { icon: Briefcase, title: 'Project Collaboration', sub: 'Work on tasks and update your progress' },
              { icon: Users, title: 'Skill Tracking', sub: 'Showcase your expertise and grow' },
              { icon: LayoutDashboard, title: 'Real-time Updates', sub: 'Stay informed with instant notifications' },
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

      {/* Right Panel - Signup Form */}
      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <SignupForm />
      </div>
    </div>
  );
}
