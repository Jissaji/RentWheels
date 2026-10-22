import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Car,
  Users,
  CalendarCheck,
  IndianRupee,
  Activity,
  CheckCircle2,
  Clock,
  Wrench,
  TrendingUp,
  BarChart3,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import { formatINR, formatDate, formatDateTime } from '../../utils/formatters';

const AdminDashboard = () => {
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const data = await adminService.getDashboardStats();
        setStatsData(data.stats);
      } catch (err) {
        console.error('Failed to load admin stats:', err);
        setError('Unable to load aggregated dashboard data from database.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Calculating database analytics..." />;
  }

  const { cars, customers, bookings, monthly, recentBookings } = statsData || {
    cars: { total_cars: 0, available_cars: 0, rented_cars: 0, maintenance_cars: 0 },
    customers: { total_customers: 0 },
    bookings: { total_bookings: 0, active_rentals: 0, pending_bookings: 0, total_revenue: 0 },
    monthly: [],
    recentBookings: []
  };

  // Find max monthly revenue for scaling CSS bar chart
  const maxRevenue = Math.max(...(monthly?.map((m) => Number(m.revenue)) || [10000]), 10000);
  const maxBookingCount = Math.max(...(monthly?.map((m) => Number(m.booking_count)) || [5]), 5);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Welcome & Summary Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Live RDBMS Fleet Intelligence
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Administrator Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time telemetry, revenue metrics, booking schedules, and fleet availability from MySQL.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/admin/cars"
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/25 transition-all flex items-center gap-1.5"
          >
            <Car className="w-4 h-4" />
            Manage Cars
          </Link>
          <Link
            to="/admin/bookings"
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all flex items-center gap-1.5"
          >
            <CalendarCheck className="w-4 h-4" />
            Review Bookings
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 6 Key Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="Total Fleet"
          value={cars.total_cars}
          icon={Car}
          color="indigo"
          subtitle="Vehicles registered"
        />
        <StatCard
          title="Available Cars"
          value={cars.available_cars}
          icon={CheckCircle2}
          color="emerald"
          subtitle="Ready for rental"
        />
        <StatCard
          title="Total Customers"
          value={customers.total_customers}
          icon={Users}
          color="blue"
          subtitle="Registered accounts"
        />
        <StatCard
          title="Total Bookings"
          value={bookings.total_bookings}
          icon={CalendarCheck}
          color="purple"
          subtitle="All-time reservations"
        />
        <StatCard
          title="Active Rentals"
          value={bookings.active_rentals}
          icon={Clock}
          color="amber"
          subtitle="Vehicles on the road"
        />
        <StatCard
          title="Total Revenue"
          value={formatINR(bookings.total_revenue)}
          icon={IndianRupee}
          color="emerald"
          subtitle="Confirmed & completed"
        />
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Monthly Revenue Bar Chart */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Monthly Revenue Progression</h3>
                <p className="text-[11px] text-slate-400">Calculated from confirmed & paid bookings</p>
              </div>
            </div>
            <span className="text-xs font-mono text-emerald-400 font-bold">
              {formatINR(bookings.total_revenue)} Total
            </span>
          </div>

          {monthly && monthly.length > 0 ? (
            <div className="h-56 flex items-end justify-between gap-3 pt-6 px-2">
              {monthly.map((m, idx) => {
                const heightPercent = Math.max(Math.round((Number(m.revenue) / maxRevenue) * 100), 12);
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                    <div className="text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity font-mono">
                      {formatINR(m.revenue)}
                    </div>
                    <div className="w-full max-w-[48px] bg-slate-950 rounded-xl overflow-hidden p-1 flex items-end h-full">
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className="w-full bg-gradient-to-t from-emerald-600 to-teal-400 rounded-lg transition-all duration-500 group-hover:brightness-110"
                      />
                    </div>
                    <div className="text-[11px] font-semibold text-slate-400 font-mono">
                      {m.month}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-xs text-slate-500">
              No monthly booking data available yet.
            </div>
          )}
        </div>

        {/* Fleet Availability Breakdown */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Car Fleet Allocation</h3>
                <p className="text-[11px] text-slate-400">Live vehicle status distribution</p>
              </div>
            </div>
            <span className="text-xs font-mono text-slate-300 font-bold">
              {cars.total_cars} Cars
            </span>
          </div>

          <div className="space-y-4 pt-2">
            {/* Available */}
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  Available Fleet
                </span>
                <span className="text-white font-mono font-bold">
                  {cars.available_cars} ({cars.total_cars ? Math.round((cars.available_cars / cars.total_cars) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden">
                <div
                  style={{ width: `${cars.total_cars ? (cars.available_cars / cars.total_cars) * 100 : 0}%` }}
                  className="h-full bg-emerald-500 rounded-full"
                />
              </div>
            </div>

            {/* Rented */}
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-400" />
                  Active on Rent
                </span>
                <span className="text-white font-mono font-bold">
                  {cars.rented_cars} ({cars.total_cars ? Math.round((cars.rented_cars / cars.total_cars) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden">
                <div
                  style={{ width: `${cars.total_cars ? (cars.rented_cars / cars.total_cars) * 100 : 0}%` }}
                  className="h-full bg-purple-500 rounded-full"
                />
              </div>
            </div>

            {/* Maintenance */}
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-orange-400" />
                  In Servicing / Maintenance
                </span>
                <span className="text-white font-mono font-bold">
                  {cars.maintenance_cars} ({cars.total_cars ? Math.round((cars.maintenance_cars / cars.total_cars) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden">
                <div
                  style={{ width: `${cars.total_cars ? (cars.maintenance_cars / cars.total_cars) * 100 : 0}%` }}
                  className="h-full bg-orange-500 rounded-full"
                />
              </div>
            </div>

            {/* Pending approvals banner */}
            <div className="mt-4 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-amber-300">
                <Clock className="w-4 h-4 shrink-0" />
                <span>
                  <strong>{bookings.pending_bookings}</strong> bookings awaiting your approval
                </span>
              </div>
              <Link
                to="/admin/bookings"
                className="text-[11px] font-bold text-amber-400 hover:text-amber-300 underline"
              >
                Review &rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Bookings Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white">Recent Customer Bookings</h3>
            <p className="text-xs text-slate-400">Latest reservations submitted through the portal</p>
          </div>
          <Link
            to="/admin/bookings"
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
          >
            View all bookings
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="text-[10px] uppercase font-semibold text-slate-400 bg-slate-950/60 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Booking ID</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Vehicle</th>
                <th className="py-3 px-4">Dates</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {recentBookings && recentBookings.length > 0 ? (
                recentBookings.map((b) => (
                  <tr key={b.booking_id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-white">
                      #{b.booking_id}
                    </td>
                    <td className="py-3 px-4 font-semibold text-white">
                      {b.customer_name}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <img
                          src={b.car_image}
                          alt={b.model}
                          className="w-8 h-6 object-cover rounded bg-slate-950"
                        />
                        <span>{b.brand} {b.model}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {formatDate(b.pickup_date)} &rarr; {formatDate(b.return_date)}
                    </td>
                    <td className="py-3 px-4 font-bold text-white">
                      {formatINR(b.total_amount)}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={b.booking_status} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        to="/admin/bookings"
                        className="px-2.5 py-1 text-[11px] font-semibold text-indigo-400 hover:text-white hover:bg-indigo-600 rounded-lg transition-colors"
                      >
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-slate-500">
                    No recent bookings recorded.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
