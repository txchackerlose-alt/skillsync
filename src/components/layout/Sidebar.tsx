'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, CheckSquare, Users, Settings, LogOut, Gem, UserCircle } from 'lucide-react';
import { logout } from '@/actions/auth';
import { useTransition } from 'react';

export default function Sidebar({ role }: { role: 'manager' | 'employee' }) {
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      await logout();
    });
  };

  const navItems = [
    { name: 'Dashboard', path: `/${role}`, icon: LayoutDashboard },
    { name: 'Tasks', path: `/${role}/tasks`, icon: CheckSquare },
    ...(role === 'manager'
      ? [{ name: 'Employees', path: `/${role}/employees`, icon: Users }]
      : []),
  ];

  return (
    <aside className="w-[260px] h-full flex flex-col bg-brand-surface/20 border-r border-brand-border backdrop-blur-md">
      {/* Top logo */}
      <div className="p-6">
        <Link href={`/${role}`} className="flex items-center gap-3 text-xl font-bold">
          <div className="p-1.5 bg-gradient-to-br from-brand-purple to-brand-teal rounded-lg">
            <Gem className="w-5 h-5 text-white" />
          </div>
          SkillSync
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1 mt-4">
        <div className="text-xs font-semibold text-brand-muted uppercase tracking-wider mb-4 px-2">Menu</div>
        {navItems.map((item) => {
          const isActive = pathname === item.path || pathname.startsWith(`${item.path}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-brand-surface text-brand-text shadow-sm'
                  : 'text-brand-muted hover:text-brand-text hover:bg-brand-surface/50'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? (role === 'manager' ? 'text-brand-teal' : 'text-brand-purple') : ''}`} />
              {item.name}
            </Link>
          );
        })}

        <div className="text-xs font-semibold text-brand-muted uppercase tracking-wider mt-8 mb-4 px-2">Account</div>
        <Link
          href={`/${role}/profile`}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
            pathname === `/${role}/profile`
              ? 'bg-brand-surface text-brand-text shadow-sm'
              : 'text-brand-muted hover:text-brand-text hover:bg-brand-surface/50'
          }`}
        >
          <UserCircle className={`w-5 h-5 ${pathname === `/${role}/profile` ? (role === 'manager' ? 'text-brand-teal' : 'text-brand-purple') : ''}`} />
          Profile
        </Link>
        <button
          onClick={handleLogout}
          disabled={isPending}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-brand-muted hover:text-red-400 hover:bg-red-400/10 transition-all text-left"
        >
          <LogOut className="w-5 h-5" />
          {isPending ? 'Logging out...' : 'Logout'}
        </button>
      </nav>

      {/* Bottom user card placeholder */}
      <div className="p-4 mt-auto">
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-brand-surface border border-brand-border">
          <div className="w-10 h-10 rounded-full bg-brand-purple/20 flex items-center justify-center text-brand-purple font-bold">
            {role === 'manager' ? 'M' : 'E'}
          </div>
          <div className="flex-1 overflow-hidden">
            <div className="text-sm font-medium truncate">My Account</div>
            <div className="text-xs text-brand-muted capitalize">{role}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
