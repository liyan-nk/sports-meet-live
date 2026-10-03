import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Trophy, Calendar, Award, ShieldCheck } from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { label: 'Home', path: '/', icon: Home, exact: true },
    { label: 'Standings', path: '/standings', icon: Trophy, exact: false },
    { label: 'Events', path: '/events', icon: Calendar, exact: false },
    { label: 'Results', path: '/results', icon: Award, exact: false },
    { label: 'Admin', path: '/admin', icon: ShieldCheck, exact: false },
  ];

  const isActive = (item: typeof navItems[0]) => {
    if (item.exact) {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(item.path);
  };

  return (
    <nav aria-label="Mobile Navigation" className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white/95 backdrop-blur-md sm:hidden shadow-lg">
      <div className="grid grid-cols-5 h-16 max-w-md mx-auto">
        {navItems.map((item) => {
          const active = isActive(item);
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center py-1 transition-colors ${
                active ? 'text-blue-600 font-semibold' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <div className={`flex items-center justify-center h-7 w-7 rounded-full ${active ? 'bg-blue-50 text-blue-600' : ''}`}>
                <Icon className="h-5 w-5" />
              </div>
              <span className="text-[11px] leading-tight mt-0.5">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
