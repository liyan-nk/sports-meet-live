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
    <nav aria-label="Mobile Navigation" className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white sm:hidden shadow-md">
      <div className="grid grid-cols-5 h-16 max-w-md mx-auto">
        {navItems.map((item) => {
          const active = isActive(item);
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center transition-colors ${
                active ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Icon className="h-5 w-5 mb-0.5" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
