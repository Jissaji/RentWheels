import React from 'react';
import { Link } from 'react-router-dom';
import { Car, Compass, ArrowLeft } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-16 bg-slate-950 text-slate-100">
      <div className="w-16 h-16 rounded-3xl bg-blue-600/15 border border-blue-500/30 text-blue-400 flex items-center justify-center mb-6">
        <Compass className="w-8 h-8" />
      </div>
      <h1 className="text-5xl font-black text-white tracking-tight mb-2">404</h1>
      <h2 className="text-lg font-bold text-slate-200 mb-2">Off-Road: Page Not Found</h2>
      <p className="text-xs text-slate-400 max-w-sm mb-6">
        The route you took doesn't exist or has moved. Let's get you back on track to the main highway.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/20 transition-all"
      >
        <ArrowLeft className="w-4 h-4" />
        Return to Home
      </Link>
    </div>
  );
};

export default NotFoundPage;
