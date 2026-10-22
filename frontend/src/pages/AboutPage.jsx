import React from 'react';
import { ShieldCheck, Award, Users, Compass, Clock, MapPin, Sparkles, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const AboutPage = () => {
  return (
    <div className="bg-slate-950 text-slate-100 py-12 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            About RentWheels
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
            Redefining Self-Drive Freedom Across India
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Founded with a vision to deliver transparent, frictionless, and secure car rentals for urban professionals, families, and road-trip enthusiasts.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">100% Verified Fleet</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every car undergoes a multi-point safety inspection, professional sanitation, and full diagnostic checks before keys are handed over.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Instant Online Reservation</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              No endless paperwork or surprise security deposits. Select your dates, calculate live transparent costs, and get confirmed instantly.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">24/7 Roadside Assistance</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Pan-India emergency support and swift breakdown assistance ensure peace of mind wherever the highway takes you.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
