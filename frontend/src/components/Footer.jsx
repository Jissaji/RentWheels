import React from 'react';
import { Link } from 'react-router-dom';
import { Car, Mail, Phone, MapPin, ShieldCheck, Clock, Award } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-900 text-slate-400 text-xs">
      {/* Top Value Badges */}
      <div className="border-b border-slate-900/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
          <div className="flex items-center gap-4 justify-center md:justify-start">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">100% Verified Fleet</h4>
              <p className="text-slate-400 mt-0.5">Every vehicle sanitised and mechanically inspected.</p>
            </div>
          </div>

          <div className="flex items-center gap-4 justify-center md:justify-start">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">24/7 Roadside Assist</h4>
              <p className="text-slate-400 mt-0.5">Round the clock pan-India support and quick pickup.</p>
            </div>
          </div>

          <div className="flex items-center gap-4 justify-center md:justify-start">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Transparent Pricing</h4>
              <p className="text-slate-400 mt-0.5">Zero hidden charges. Transparent daily tariff with GST.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand Description */}
        <div className="space-y-4">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md">
              <Car className="w-5 h-5" />
            </div>
            <span className="text-lg font-black tracking-tight text-white">
              RENT<span className="text-blue-500">WHEELS</span>
            </span>
          </Link>
          <p className="text-slate-400 leading-relaxed text-xs">
            RentWheels is India’s premier automated car rental management platform delivering luxury, SUV, and economy self-drive rentals with guaranteed availability.
          </p>
          <div className="text-[11px] text-blue-400 font-medium">
            Premium Self-Drive Mobility Network
          </div>
        </div>

        {/* Fleet Categories */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Fleet Categories</h4>
          <ul className="space-y-2.5">
            <li><Link to="/cars?fuel_type=Hybrid" className="hover:text-blue-400 transition-colors">Premium MPVs (Innova)</Link></li>
            <li><Link to="/cars?seats=4" className="hover:text-blue-400 transition-colors">4x4 Off-Roaders (Thar)</Link></li>
            <li><Link to="/cars?fuel_type=Electric" className="hover:text-blue-400 transition-colors">Electric Vehicles (Nexon EV)</Link></li>
            <li><Link to="/cars?min_price=5000" className="hover:text-blue-400 transition-colors">Luxury Sedans (BMW 3 Series)</Link></li>
            <li><Link to="/cars?fuel_type=Petrol" className="hover:text-blue-400 transition-colors">Economy Hatchbacks (Swift)</Link></li>
          </ul>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Quick Links</h4>
          <ul className="space-y-2.5">
            <li><Link to="/" className="hover:text-blue-400 transition-colors">Home Page</Link></li>
            <li><Link to="/cars" className="hover:text-blue-400 transition-colors">Browse All Cars</Link></li>
            <li><Link to="/login" className="hover:text-blue-400 transition-colors">Customer Login</Link></li>
            <li><Link to="/register" className="hover:text-blue-400 transition-colors">Create Account</Link></li>
            <li><Link to="/admin/dashboard" className="hover:text-blue-400 transition-colors">Admin Portal</Link></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Corporate Office</h4>
          <div className="space-y-3">
            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <a
                href="https://maps.google.com/?q=Block+B,+Connaught+Place,+New+Delhi+-+110001,+India"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-400 transition-colors leading-tight"
              >
                Block B, Connaught Place, New Delhi - 110001, India
              </a>
            </div>
            <div className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-blue-400 shrink-0" />
              <a
                href="tel:+919876543210"
                className="hover:text-blue-400 transition-colors"
              >
                +91 98765 43210 / 1800-RENT-CAR
              </a>
            </div>
            <div className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-blue-400 shrink-0" />
              <a
                href="mailto:supportrentwheel@gmail.com"
                className="hover:text-blue-400 transition-colors"
              >
                supportrentwheel@gmail.com
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-900 py-6 text-center text-[11px] text-slate-400">
        © {new Date().getFullYear()} RentWheels Car Rental Management System. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
