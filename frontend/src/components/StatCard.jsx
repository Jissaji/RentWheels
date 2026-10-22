import React from 'react';

const StatCard = ({ title, value, icon: Icon, changeText, color = 'blue' }) => {
  const colorMap = {
    blue: 'from-blue-500/20 to-blue-600/5 text-blue-400 border-blue-500/30',
    emerald: 'from-emerald-500/20 to-emerald-600/5 text-emerald-400 border-emerald-500/30',
    purple: 'from-purple-500/20 to-purple-600/5 text-purple-400 border-purple-500/30',
    amber: 'from-amber-500/20 to-amber-600/5 text-amber-400 border-amber-500/30',
    rose: 'from-rose-500/20 to-rose-600/5 text-rose-400 border-rose-500/30'
  };

  const selectedColor = colorMap[color] || colorMap.blue;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-slate-900/90 border border-slate-800/80 p-5 shadow-lg hover:border-slate-700 transition-all">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium uppercase tracking-wider text-slate-400">{title}</span>
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br border flex items-center justify-center ${selectedColor}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="text-2xl font-black text-white tracking-tight">{value}</div>
      {changeText && (
        <div className="mt-2 text-xs text-slate-400 flex items-center gap-1 font-medium">
          {changeText}
        </div>
      )}
    </div>
  );
};

export default StatCard;
