import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Car, Mail, Lock, LogIn, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const LoginPage = () => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const from = location.state?.from?.pathname || null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await login(email.trim(), password);
      showToast(`Welcome back, ${data.user.name}!`, 'success');

      // Smart redirection based on role or intended destination
      if (from && from !== '/login' && from !== '/register') {
        if (from.startsWith('/admin') && data.user.role !== 'Admin') {
          navigate(data.user.role === 'Staff' ? '/staff/pickup-return' : '/customer/dashboard', { replace: true });
        } else {
          navigate(from, { replace: true });
        }
      } else if (data.user.role === 'Admin') {
        navigate('/admin/dashboard', { replace: true });
      } else if (data.user.role === 'Staff') {
        navigate('/staff/pickup-return', { replace: true });
      } else {
        navigate('/customer/dashboard', { replace: true });
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check credentials.';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        {/* Brand header */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-xl shadow-blue-500/25 group-hover:scale-105 transition-transform">
              <Car className="w-6 h-6" />
            </div>
            <span className="text-2xl font-black tracking-tight text-white">
              RENT<span className="text-blue-500">WHEELS</span>
            </span>
          </Link>
          <h2 className="mt-4 text-2xl font-extrabold text-white tracking-tight">
            Sign in to your account
          </h2>
          <p className="mt-2 text-xs text-slate-400">
            Access bookings, real-time rates, and manage your vehicle rentals.
          </p>
        </div>

        {/* Main Login Card */}
        <div className="mt-8 bg-slate-900/80 backdrop-blur-xl border border-slate-800 py-8 px-6 shadow-2xl rounded-2xl sm:px-10">
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="your.email@example.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-slate-300">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 shadow-lg shadow-blue-600/25 transition-all hover:scale-[1.01]"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span>Verifying credentials...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="mt-5 pt-4 border-t border-slate-800/80">
            <span className="text-[11px] font-semibold text-slate-400 block mb-2 text-center uppercase tracking-wider">
              Quick Demo Logins
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setEmail('admin@rentwheels.com');
                  setPassword('admin123');
                }}
                className="py-1.5 px-2 rounded-lg bg-slate-950 border border-slate-800 hover:border-indigo-500 text-[11px] text-indigo-300 font-semibold transition-colors text-center"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail('staff@rentwheels.com');
                  setPassword('password123');
                }}
                className="py-1.5 px-2 rounded-lg bg-slate-950 border border-slate-800 hover:border-amber-500 text-[11px] text-amber-300 font-semibold transition-colors text-center"
              >
                Staff
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail('rajesh.sharma@example.com');
                  setPassword('password123');
                }}
                className="py-1.5 px-2 rounded-lg bg-slate-950 border border-slate-800 hover:border-blue-500 text-[11px] text-blue-300 font-semibold transition-colors text-center"
              >
                Customer
              </button>
            </div>
          </div>

          {/* Footer note */}
          <div className="mt-6 pt-5 border-t border-slate-800 text-center">
            <p className="text-xs text-slate-400">
              Don't have an account yet?{' '}
              <Link to="/register" className="font-semibold text-blue-400 hover:text-blue-300 inline-flex items-center gap-0.5">
                Create one now
                <ArrowRight className="w-3 h-3" />
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
