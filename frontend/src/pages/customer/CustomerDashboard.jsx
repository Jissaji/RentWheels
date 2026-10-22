import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CalendarCheck,
  Car,
  Clock,
  IndianRupee,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  User,
  CreditCard,
  MapPin,
  Calendar,
  Sparkles
} from 'lucide-react';
import { bookingService } from '../../services/bookingService';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import { formatINR, formatDate } from '../../utils/formatters';

const CustomerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const data = await bookingService.getCustomerSummary();
        setSummary(data);
      } catch (err) {
        console.error('Error fetching customer summary:', err);
        setError('Unable to load dashboard details.');
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading your dashboard..." />;
  }

  const stats = summary?.stats || {
    active_bookings: 0,
    total_bookings: 0,
    completed_rentals: 0,
    total_spent: 0
  };

  const currentBooking = summary?.currentBooking || null;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-900/40 via-indigo-950/40 to-slate-900 border border-blue-500/20 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-full bg-blue-500/5 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Customer Self-Service Hub
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-xl">
              Track your ongoing trips, manage upcoming vehicle bookings, or explore our new fleet additions for your next journey.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/cars"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/25 transition-all flex items-center gap-2"
            >
              <Car className="w-4 h-4" />
              Rent a Car
            </Link>
            <Link
              to="/customer/bookings"
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all flex items-center gap-2"
            >
              <CalendarCheck className="w-4 h-4" />
              My Bookings
            </Link>
          </div>
        </div>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Bookings"
          value={stats.active_bookings}
          icon={Clock}
          color="blue"
          subtitle="Currently ongoing or upcoming"
        />
        <StatCard
          title="Total Bookings"
          value={stats.total_bookings}
          icon={CalendarCheck}
          color="indigo"
          subtitle="Lifetime reservations made"
        />
        <StatCard
          title="Completed Rentals"
          value={stats.completed_rentals}
          icon={CheckCircle2}
          color="emerald"
          subtitle="Successful journeys finished"
        />
        <StatCard
          title="Total Spent"
          value={formatINR(stats.total_spent)}
          icon={IndianRupee}
          color="amber"
          subtitle="Excludes cancelled bookings"
        />
      </div>

      {/* Current Booking Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Car className="w-5 h-5 text-blue-400" />
            Current Active / Upcoming Booking
          </h2>
          <Link
            to="/customer/bookings"
            className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
          >
            View all history
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {currentBooking ? (
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Car Image */}
            <div className="lg:col-span-4 h-48 rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 relative">
              <img
                src={currentBooking.car_image}
                alt={`${currentBooking.brand} ${currentBooking.model}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3">
                <StatusBadge status={currentBooking.booking_status} />
              </div>
            </div>

            {/* Booking Details */}
            <div className="lg:col-span-5 space-y-3">
              <div>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Booking #{currentBooking.booking_id}
                </div>
                <h3 className="text-xl font-bold text-white">
                  {currentBooking.brand} {currentBooking.model}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5 font-mono">
                  Plate: {currentBooking.registration_number}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800">
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Pickup Date</span>
                  <span className="text-xs font-bold text-white flex items-center gap-1.5 mt-1">
                    <Calendar className="w-3.5 h-3.5 text-blue-400" />
                    {formatDate(currentBooking.pickup_date)}
                  </span>
                </div>

                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Return Date</span>
                  <span className="text-xs font-bold text-white flex items-center gap-1.5 mt-1">
                    <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                    {formatDate(currentBooking.return_date)}
                  </span>
                </div>
              </div>
            </div>

            {/* Price & Actions */}
            <div className="lg:col-span-3 flex flex-col justify-center items-start lg:items-end lg:border-l lg:border-slate-800 lg:pl-6 space-y-3">
              <div>
                <span className="text-xs text-slate-400 block">Total Amount</span>
                <span className="text-2xl font-black text-white">
                  {formatINR(currentBooking.total_amount)}
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  Payment: <span className="font-semibold text-emerald-400">{currentBooking.payment_status || 'Paid'}</span>
                </span>
              </div>

              <div className="w-full flex flex-col gap-2 pt-2">
                <Link
                  to="/customer/bookings"
                  className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold text-center shadow-lg shadow-blue-600/20 transition-all"
                >
                  Manage This Booking
                </Link>
                <Link
                  to={`/cars/${currentBooking.car_id}`}
                  className="w-full py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold text-center transition-colors"
                >
                  View Vehicle Specs
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800/80 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto">
              <Car className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">No active trip right now</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              You do not have any active or pending car rentals scheduled. Ready to hit the road?
            </p>
            <Link
              to="/cars"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/20 transition-all"
            >
              <Car className="w-4 h-4" />
              Explore Rental Fleet
            </Link>
          </div>
        )}
      </div>

      {/* Quick Actions Shortcuts Grid */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white tracking-tight">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            to="/cars"
            className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-blue-500/40 transition-all group flex items-start gap-4"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-600/15 border border-blue-500/30 text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                Rent a Car
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Browse available hatchbacks, sedans, luxury MPVs, and off-road SUVs.
              </p>
            </div>
          </Link>

          <Link
            to="/customer/bookings"
            className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/40 transition-all group flex items-start gap-4"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-600/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">
                My Bookings
              </div>
              <p className="text-xs text-slate-400 mt-1">
                View all trip invoices, payment receipts, and manage active reservations.
              </p>
            </div>
          </Link>

          <Link
            to="/customer/profile"
            className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 transition-all group flex items-start gap-4"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-600/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
                Account Profile
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Update phone, driving license number, address, and login credentials.
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
