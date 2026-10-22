import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Search,
  Filter,
  IndianRupee,
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  RotateCcw,
  User,
  ArrowRight
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { useToast } from '../../context/ToastContext';
import { formatINR, formatDate, formatDateTime } from '../../utils/formatters';

const AdminPaymentsPage = () => {
  const { showToast } = useToast();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [methodFilter, setMethodFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const data = await adminService.getAllPayments();
      setPayments(data.payments || []);
    } catch (err) {
      console.error('Failed to load payments:', err);
      showToast('Could not load payment records from database.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleUpdatePaymentStatus = async (paymentId, newStatus) => {
    try {
      await adminService.updatePaymentStatus(paymentId, newStatus);
      showToast(`Payment #${paymentId} status set to ${newStatus}.`, 'success');
      fetchPayments();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update payment.';
      showToast(msg, 'error');
    }
  };

  const filteredPayments = payments.filter((p) => {
    const matchesSearch =
      searchTerm === '' ||
      p.payment_id.toString().includes(searchTerm) ||
      p.booking_id.toString().includes(searchTerm) ||
      (p.customer_name && p.customer_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.transaction_id && p.transaction_id.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesMethod = methodFilter === 'ALL' || p.payment_method === methodFilter;
    const matchesStatus = statusFilter === 'ALL' || p.payment_status === statusFilter;

    return matchesSearch && matchesMethod && matchesStatus;
  });

  const totalCollected = payments
    .filter((p) => p.payment_status === 'Paid')
    .reduce((sum, p) => sum + Number(p.amount), 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-indigo-500" />
            Payment & Revenue Transactions
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Audit customer payments, manage transaction receipts, and issue simulated refunds.
          </p>
        </div>

        <div className="p-3 px-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/20 flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <div>
            <span className="text-[10px] uppercase font-semibold text-emerald-400 block">Total Settled</span>
            <span className="text-base font-black text-white">{formatINR(totalCollected)}</span>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search by ID, booking, customer, txn..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Payment Methods</option>
            <option value="UPI">UPI (Google Pay / PhonePe)</option>
            <option value="Card">Credit / Debit Card</option>
            <option value="Net Banking">Net Banking</option>
            <option value="Cash">Cash at Pickup</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
            <option value="Failed">Failed</option>
            <option value="Refunded">Refunded</option>
          </select>

          <button
            onClick={fetchPayments}
            className="px-3 py-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 rounded-xl"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Payments Table */}
      {loading ? (
        <LoadingSpinner message="Loading financial transactions..." />
      ) : filteredPayments.length === 0 ? (
        <EmptyState
          title="No payment records found"
          message="No transactions match your current filters."
        />
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Payment ID</th>
                  <th className="py-3.5 px-4">Booking Ref</th>
                  <th className="py-3.5 px-4">Customer Name</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Method</th>
                  <th className="py-3.5 px-4">Transaction ID</th>
                  <th className="py-3.5 px-4">Payment Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredPayments.map((p) => (
                  <tr key={p.payment_id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-white">
                      #{p.payment_id}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-indigo-400 font-semibold">
                      Booking #{p.booking_id}
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-white">
                      {p.customer_name || 'Customer'}
                    </td>

                    <td className="py-3.5 px-4 font-black text-white text-sm">
                      {formatINR(p.amount)}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-medium text-slate-300">
                        {p.payment_method}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400">
                      {p.transaction_id || 'TXN-CASH'}
                    </td>

                    <td className="py-3.5 px-4 text-slate-400">
                      {formatDateTime(p.payment_date)}
                    </td>

                    <td className="py-3.5 px-4">
                      <StatusBadge status={p.payment_status} />
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {p.payment_status === 'Pending' && (
                          <button
                            onClick={() => handleUpdatePaymentStatus(p.payment_id, 'Paid')}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-sm transition-all"
                          >
                            Mark Paid
                          </button>
                        )}
                        {p.payment_status === 'Paid' && (
                          <button
                            onClick={() => handleUpdatePaymentStatus(p.payment_id, 'Refunded')}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          >
                            Refund
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPaymentsPage;
