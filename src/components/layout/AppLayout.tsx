import React from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function AppLayout({
  children,
  role,
  title
}: {
  children: React.ReactNode;
  role: 'manager' | 'employee';
  title: string;
}) {
  return (
    <div className="flex h-screen bg-brand-bg text-brand-text overflow-hidden relative">
      {/* Background Orbs */}
      <div className="absolute w-[600px] h-[600px] bg-brand-purple/10 rounded-full blur-[100px] -top-32 -left-32 pointer-events-none" />
      <div className="absolute w-[450px] h-[450px] bg-brand-teal/10 rounded-full blur-[100px] -bottom-32 -right-32 pointer-events-none" />
      
      <Sidebar role={role} />
      
      <div className="flex-1 flex flex-col min-w-0 z-10">
        <Topbar title={title} />
        <main className="flex-1 overflow-y-auto p-8 relative">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
