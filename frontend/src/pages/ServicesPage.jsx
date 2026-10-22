import React from 'react';
import { Car, Shield, Compass, Clock, Fuel, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const ServicesPage = () => {
  const services = [
    {
      title: 'Self-Drive Daily & Weekend Rentals',
      desc: 'Pick up a car for a short city commute, weekend getaway, or grocery haul. Zero driver intrusion, complete privacy.',
      icon: Car,
      tag: 'Most Popular'
    },
    {
      title: 'Long-Duration & Monthly Subscriptions',
      desc: 'Cost-effective multi-week or monthly packages for corporate executives and extended family holidays with zero maintenance hassle.',
      icon: Clock,
      tag: 'Best Value'
    },
    {
      title: 'Wedding & VIP Luxury Fleet',
      desc: 'Arrive in style with our executive series sedans and luxury SUVs (BMW 3 Series, Toyota Fortuner, Innova Hycross).',
      icon: Sparkles,
      tag: 'Executive Class'
    },
    {
      title: 'Interstate Outstation Travel',
      desc: 'All-India tourist permits (AITP) included so you can cruise freely across state boundaries with zero toll booth permit surprises.',
      icon: Compass,
      tag: 'All-India Permit'
    },
    {
      title: 'Airport Drop & Delivery',
      desc: 'Have your vehicle delivered directly to terminal arrival bays or picked up at your doorstep at requested hours.',
      icon: Fuel,
      tag: 'Convenience'
    },
    {
      title: 'Comprehensive Insurance & Roadside SOS',
      desc: 'Every booking includes damage liability coverage, zero-depreciation options, and on-call mechanic dispatch.',
      icon: Shield,
      tag: '100% Protected'
    }
  ];

  return (
    <div className="bg-slate-950 text-slate-100 py-12 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            Our Offerings
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
            Tailored Rental Solutions for Every Journey
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            From city runabouts to cross-country expeditions, discover services designed around speed, safety, and utmost comfort.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div
                key={idx}
                className="p-8 rounded-3xl bg-slate-900 border border-slate-800 hover:border-blue-500/40 transition-all flex flex-col justify-between space-y-6 group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-blue-600/15 border border-blue-500/30 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-950 border border-slate-800 text-blue-400">
                      {s.tag}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
                    {s.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {s.desc}
                  </p>
                </div>

                <Link
                  to="/cars"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300 pt-2"
                >
                  Book this category
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ServicesPage;
