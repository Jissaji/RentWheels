import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Car,
  User,
  LogOut,
  LayoutDashboard,
  Shield,
  Menu,
  X,
  CalendarCheck,
  Bell,
  KeyRound,
  CheckCheck,
  CheckCircle2,
  AlertCircle,
  Clock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { notificationService } from '../services/notificationService';
import { formatDateTime } from '../utils/formatters';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, isStaff, isCustomer, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Notifications state
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const fetchNotifications = async () => {
    if (!isAuthenticated) return;
    try {
      const data = await notificationService.getMyNotifications();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unread_count || 0);
    } catch (err) {
      // Silent error handler for navbar background check
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 25000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, location.pathname]);

  // Click outside to close notification popover
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id, e) => {
    e.stopPropagation();
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: 1 } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-40 w-full bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 py-3">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-white flex items-center gap-1">
                RENT<span className="text-blue-500">WHEELS</span>
              </span>
              <span className="text-[10px] text-slate-400 block tracking-wider uppercase -mt-1 font-semibold">
                Auto Rentals
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            <Link
              to="/"
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors ${
                isActive('/') ? 'text-blue-400 bg-blue-500/10' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              Home
            </Link>
            <Link
              to="/cars"
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors ${
                isActive('/cars') ? 'text-blue-400 bg-blue-500/10' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              Cars
            </Link>
            <Link
              to="/services"
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors ${
                isActive('/services') ? 'text-blue-400 bg-blue-500/10' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              Services
            </Link>
            <Link
              to="/about"
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors ${
                isActive('/about') ? 'text-blue-400 bg-blue-500/10' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              About
            </Link>
            <Link
              to="/contact"
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors ${
                isActive('/contact') ? 'text-blue-400 bg-blue-500/10' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              Contact
            </Link>
          </div>

          {/* Desktop Right Auth Actions */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-2.5">
                {/* 1. Admin link */}
                {isAdmin && (
                  <Link
                    to="/admin/dashboard"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/20 transition-all"
                  >
                    <Shield className="w-3.5 h-3.5 text-amber-300" />
                    Admin
                  </Link>
                )}

                {/* 2. Staff link (both Staff and Admin can view) */}
                {isStaff && (
                  <Link
                    to="/staff/pickup-return"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-amber-300 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 transition-all"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    Staff Ops
                  </Link>
                )}

                {/* 3. Customer Links */}
                {!isAdmin && (
                  <>
                    <Link
                      to="/customer/dashboard"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-600/20 transition-all"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5" />
                      Dashboard
                    </Link>
                    <Link
                      to="/customer/bookings"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
                    >
                      <CalendarCheck className="w-3.5 h-3.5 text-blue-400" />
                      My Bookings
                    </Link>
                  </>
                )}

                {/* In-App Notifications Bell */}
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={() => setNotifOpen(!notifOpen)}
                    className="relative p-2 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-xl transition-colors"
                    title="Notifications"
                    aria-label="View notifications"
                  >
                    <Bell className="w-4 h-4" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-blue-500 text-white text-[10px] font-black rounded-full flex items-center justify-center animate-pulse shadow-md shadow-blue-500/40">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notification Dropdown Popover */}
                  {notifOpen && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50 animate-fade-in">
                      <div className="p-3.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Bell className="w-4 h-4 text-blue-400" />
                          <h4 className="text-xs font-bold text-white">Notifications</h4>
                          {unreadCount > 0 && (
                            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-400">
                              {unreadCount} new
                            </span>
                          )}
                        </div>
                        {unreadCount > 0 && (
                          <button
                            onClick={handleMarkAllAsRead}
                            className="text-[11px] font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
                          >
                            <CheckCheck className="w-3.5 h-3.5" />
                            Mark all read
                          </button>
                        )}
                      </div>

                      <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
                        {notifications.length === 0 ? (
                          <div className="p-6 text-center text-slate-500 text-xs">
                            No notifications yet.
                          </div>
                        ) : (
                          notifications.map((n) => (
                            <div
                              key={n.id}
                              onClick={() => n.is_read === 0 && handleMarkAsRead(n.id, { stopPropagation: () => {} })}
                              className={`p-3.5 text-xs transition-colors cursor-pointer flex items-start gap-3 ${
                                n.is_read === 0 ? 'bg-blue-950/20 hover:bg-blue-950/30' : 'hover:bg-slate-800/40'
                              }`}
                            >
                              <div
                                className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center mt-0.5 ${
                                  n.type === 'SUCCESS'
                                    ? 'bg-emerald-500/10 text-emerald-400'
                                    : n.type === 'ALERT'
                                    ? 'bg-rose-500/10 text-rose-400'
                                    : 'bg-blue-500/10 text-blue-400'
                                }`}
                              >
                                {n.type === 'SUCCESS' ? (
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                ) : (
                                  <AlertCircle className="w-3.5 h-3.5" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-1">
                                  <h5
                                    className={`text-xs truncate ${
                                      n.is_read === 0 ? 'font-bold text-white' : 'font-medium text-slate-300'
                                    }`}
                                  >
                                    {n.title}
                                  </h5>
                                  <span className="text-[10px] text-slate-500 shrink-0">
                                    {formatDateTime(n.created_at)}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                                  {n.message}
                                </p>
                              </div>
                              {n.is_read === 0 && (
                                <button
                                  onClick={(e) => handleMarkAsRead(n.id, e)}
                                  className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-1.5 hover:scale-125 transition-transform"
                                  title="Mark as read"
                                />
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User menu & Logout */}
                <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
                  <div className="text-right">
                    <div className="text-xs font-bold text-white truncate max-w-[120px]">{user?.name}</div>
                    <div className="text-[10px] text-slate-400">{user?.role}</div>
                  </div>
                  <button
                    onClick={handleLogout}
                    title="Logout"
                    className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 rounded-xl transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl transition-all"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-lg shadow-blue-600/20 transition-all"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger button */}
          <div className="md:hidden flex items-center gap-2">
            {isAuthenticated && (
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-blue-500 rounded-full" />
                )}
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-950 border-b border-slate-800 px-4 pt-2 pb-5 space-y-2 animate-fade-in">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className={`block px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
              isActive('/') ? 'text-blue-400 bg-blue-500/10' : 'text-slate-200 hover:bg-slate-800'
            }`}
          >
            Home
          </Link>
          <Link
            to="/cars"
            onClick={() => setMobileMenuOpen(false)}
            className={`block px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
              isActive('/cars') ? 'text-blue-400 bg-blue-500/10' : 'text-slate-200 hover:bg-slate-800'
            }`}
          >
            Cars
          </Link>
          <Link
            to="/services"
            onClick={() => setMobileMenuOpen(false)}
            className={`block px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
              isActive('/services') ? 'text-blue-400 bg-blue-500/10' : 'text-slate-200 hover:bg-slate-800'
            }`}
          >
            Services
          </Link>
          <Link
            to="/about"
            onClick={() => setMobileMenuOpen(false)}
            className={`block px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
              isActive('/about') ? 'text-blue-400 bg-blue-500/10' : 'text-slate-200 hover:bg-slate-800'
            }`}
          >
            About
          </Link>
          <Link
            to="/contact"
            onClick={() => setMobileMenuOpen(false)}
            className={`block px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
              isActive('/contact') ? 'text-blue-400 bg-blue-500/10' : 'text-slate-200 hover:bg-slate-800'
            }`}
          >
            Contact
          </Link>

          <div className="pt-3 border-t border-slate-800">
            {isAuthenticated ? (
              <div className="space-y-2">
                <div className="px-3 py-1 text-xs text-slate-400">
                  Signed in as <span className="text-white font-semibold">{user?.name}</span> ({user?.role})
                </div>
                {isAdmin && (
                  <Link
                    to="/admin/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2.5 rounded-xl text-sm font-bold bg-indigo-600 text-white"
                  >
                    Admin Portal
                  </Link>
                )}
                {isStaff && (
                  <Link
                    to="/staff/pickup-return"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2.5 rounded-xl text-sm font-bold bg-amber-500 text-slate-950"
                  >
                    Staff Operations Portal
                  </Link>
                )}
                {!isAdmin && (
                  <>
                    <Link
                      to="/customer/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-3 py-2.5 rounded-xl text-sm font-bold bg-blue-600 text-white"
                    >
                      Customer Dashboard
                    </Link>
                    <Link
                      to="/customer/bookings"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-200 hover:bg-slate-800"
                    >
                      My Bookings
                    </Link>
                  </>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 rounded-xl text-sm font-semibold text-rose-400 hover:bg-slate-800"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex gap-2 pt-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-white"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2.5 rounded-xl bg-blue-600 text-xs font-bold text-white"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
