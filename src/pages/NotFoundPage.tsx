import React from 'react';
import { Link } from 'react-router-dom';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="py-16 text-center space-y-4">
      <h1 className="font-sports text-6xl text-slate-700">404</h1>
      <h2 className="font-sports text-2xl text-white">Page Not Found</h2>
      <p className="text-xs text-slate-400">The page you requested does not exist or has moved.</p>
      <div>
        <Link
          to="/"
          className="inline-block rounded bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400"
        >
          View Standings
        </Link>
      </div>
    </div>
  );
};
