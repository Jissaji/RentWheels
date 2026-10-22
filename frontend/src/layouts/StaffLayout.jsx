import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import {
  KeyRound,
  Car,
  CalendarCheck,
  ShieldAlert,
  LogOut,
  Menu,
  X,
  ArrowLeft,
  Shield,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const StaffLayout = () => {
  const { user, isAuthenticated, isStaff, isAdmin, loading, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return <LoadingSpinner fullScreen message="Checking staff privileges..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isStaff) {
    // Only Staff and Admin roles are permitted in the staff operations portal
    return <Navigate to="/customer/dashboard" replace />;
  }

  const navItems = [
    { name: 'Pickup & Return Ops', path: '/staff/pickup-return', icon: KeyRound },
    { name: 'Fleet Inventory View', path: '/staff/cars', icon: Car }
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-100">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Staff Operations Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-5">
          {/* Brand header */}
          <div className="flex items-center justify-between pb-6 border-b border-slate-800">
            <Link to="/" className="flex items-center gap-2.5 group" title="Return to RentWheels Home">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
                <KeyRound className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-base font-black tracking-tight text-white block">
                  STAFF<span className="text-amber-400">OPS</span>
                </span>
                <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase -mt-0.5 block">
                  Handover & Inspection
                </span>
              </div>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Staff Info Badge */}
          <div className="mt-5 p-3 rounded-2xl bg-amber-950/30 border border-amber-500/20">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-xs font-bold text-white truncate">{user?.name}</span>
            </div>
            <div className="text-[11px] text-amber-300 mt-0.5 flex items-center justify-between">
              <span>{user?.role === 'Admin' ? 'Administrator (Staff Mode)' : 'Fleet Operations Staff'}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono">STAFF</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="mt-6 space-y-1">
            {navItems.map((item) => {
              const active = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    active
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {item.name}
                </Link>
              );
            })}

            {isAdmin && (
              <Link
                to="/admin/dashboard"
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-indigo-400 hover:text-white hover:bg-indigo-950/40 border border-indigo-900/30 transition-all mt-4"
              >
                <Shield className="w-4 h-4 shrink-0" />
                Go to Admin Console
              </Link>
            )}
          </nav>
        </div>

        {/* Footer actions */}
        <div className="p-5 border-t border-slate-800 space-y-2">
          <Link
            to="/"
            className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors px-3 py-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Public Website
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 px-3 py-2 rounded-xl transition-all"
          >
            <LogOut className="w-4 h-4" />
            Log Out
          </button>
        </div>
      </aside>

      {/* Main Staff Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 h-16 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <h1 className="text-sm font-bold text-white">
                RentWheels Handover & Inspection Center
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="hidden sm:inline bg-amber-500/10 text-amber-300 border border-amber-500/20 px-3 py-1 rounded-full font-mono text-[11px]">
              Role: {user?.role}
            </span>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default StaffLayout;
