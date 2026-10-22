import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ message = 'Loading...', fullScreen = false }) => {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-sm">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
        {message && <p className="mt-3 text-sm text-slate-400 font-medium">{message}</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      {message && <p className="mt-2 text-xs text-slate-400 font-medium">{message}</p>}
    </div>
  );
};

export default LoadingSpinner;
