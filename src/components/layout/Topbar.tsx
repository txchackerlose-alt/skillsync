import { Bell, Search } from 'lucide-react';

export default function Topbar({ title }: { title: string }) {
  return (
    <header className="h-20 px-8 flex items-center justify-between border-b border-brand-border bg-brand-bg/50 backdrop-blur-md sticky top-0 z-20">
      <h1 className="text-2xl font-semibold">{title}</h1>
      
      <div className="flex items-center gap-6">
        <div className="relative hidden md:block">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
          <input
            type="text"
            placeholder="Search..."
            className="w-64 pl-10 pr-4 py-2 bg-brand-surface border border-brand-border rounded-full text-sm focus:outline-none focus:border-brand-purple focus:ring-1 focus:ring-brand-purple transition-all"
          />
        </div>
        
        <button className="relative p-2 text-brand-muted hover:text-brand-text transition-colors rounded-full hover:bg-brand-surface">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-pink rounded-full border-2 border-brand-bg"></span>
        </button>
      </div>
    </header>
  );
}
