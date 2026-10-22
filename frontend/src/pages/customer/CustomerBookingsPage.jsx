import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarCheck,
  Car,
  Calendar,
  IndianRupee,
  AlertCircle,
  XCircle,
  FileText,
  CreditCard,
  Search,
  CheckCircle2,
  Clock,
  Eye,
  X,
  MapPin
} from 'lucide-react';
import { bookingService } from '../../services/bookingService';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import ConfirmationDialog from '../../components/ConfirmationDialog';
import { useToast } from '../../context/ToastContext';
import { formatINR, formatDate, formatDateTime } from '../../utils/formatters';

const CustomerBookingsPage = () => {
  const { showToast } = useToast();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Selected booking for invoice/details modal
  const [detailModalBooking, setDetailModalBooking] = useState(null);

  // Cancellation modal state
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  // Simulated Payment Modal
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [bookingToPay, setBookingToPay] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [paying, setPaying] = useState(false);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const data = await bookingService.getMyBookings();
      setBookings(data.bookings || []);
    } catch (err) {
      console.error('Failed to load bookings:', err);
      showToast('Could not fetch booking history.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleOpenCancel = (booking) => {
    setBookingToCancel(booking);
    setCancelReason('');
    setCancelModalOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!bookingToCancel) return;
    setCancelling(true);
    try {
      await bookingService.cancelBooking(bookingToCancel.booking_id, cancelReason || 'Cancelled by customer');
      showToast(`Booking #${bookingToCancel.booking_id} cancelled successfully.`, 'success');
      setCancelModalOpen(false);
      setBookingToCancel(null);
      fetchBookings();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to cancel booking.';
      showToast(msg, 'error');
    } finally {
      setCancelling(false);
    }
  };

  const handleOpenPay = (booking) => {
    setBookingToPay(booking);
    setPaymentMethod('UPI');
    setPayModalOpen(true);
  };

  const handleProcessPayment = async () => {
    if (!bookingToPay) return;
    setPaying(true);
    // Simulate real gateway processing delay
    setTimeout(async () => {
      try {
        // Backend booking status update or auto paid
        showToast(`Payment of ${formatINR(bookingToPay.total_amount)} received successfully via ${paymentMethod}!`, 'success');
        setPayModalOpen(false);
        setBookingToPay(null);
        fetchBookings();
      } catch (err) {
        showToast('Payment processing error.', 'error');
      } finally {
        setPaying(false);
      }
    }, 1200);
  };

  // Filter bookings based on active tab and search
  const filteredBookings = bookings.filter((b) => {
    const matchesTab =
      activeTab === 'ALL' ? true : b.booking_status.toUpperCase() === activeTab;
    const matchesSearch =
      searchTerm === '' ||
      `${b.brand} ${b.model}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.booking_id.toString().includes(searchTerm) ||
      (b.registration_number && b.registration_number.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesTab && matchesSearch;
  });

  const tabs = [
    { id: 'ALL', label: 'All Bookings', count: bookings.length },
    { id: 'PENDING', label: 'Pending', count: bookings.filter((b) => b.booking_status === 'Pending').length },
    { id: 'CONFIRMED', label: 'Confirmed', count: bookings.filter((b) => b.booking_status === 'Confirmed').length },
    { id: 'ACTIVE', label: 'Active', count: bookings.filter((b) => b.booking_status === 'Active').length },
    { id: 'COMPLETED', label: 'Completed', count: bookings.filter((b) => b.booking_status === 'Completed').length },
    { id: 'CANCELLED', label: 'Cancelled', count: bookings.filter((b) => b.booking_status === 'Cancelled').length }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <CalendarCheck className="w-6 h-6 text-blue-500" />
            My Bookings & Rental History
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage your current trips, download invoices, or cancel eligible reservations.
          </p>
        </div>

        <Link
          to="/cars"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/20 transition-all self-start sm:self-auto"
        >
          <Car className="w-4 h-4" />
          Book Another Car
        </Link>
      </div>

      {/* Tabs & Search Filter Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                    : 'bg-slate-950/60 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search box */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search by car, ID, plate..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Bookings List / Table */}
      {loading ? (
        <LoadingSpinner message="Fetching your bookings..." />
      ) : filteredBookings.length === 0 ? (
        <EmptyState
          title="No bookings found"
          message={
            searchTerm
              ? 'No reservations matched your search query.'
              : 'You do not have any bookings in this status category.'
          }
          actionText="Browse Available Cars"
          actionTo="/cars"
        />
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Booking ID</th>
                  <th className="py-3.5 px-4">Car Details</th>
                  <th className="py-3.5 px-4">Pickup Location</th>
                  <th className="py-3.5 px-4">Rental Dates</th>
                  <th className="py-3.5 px-4">Total Amount</th>
                  <th className="py-3.5 px-4">Payment</th>
                  <th className="py-3.5 px-4">Booking Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredBookings.map((b) => {
                  const isEligibleForCancel =
                    ['Pending', 'Confirmed'].includes(b.booking_status) &&
                    new Date(b.pickup_date) >= new Date(new Date().setHours(0, 0, 0, 0));

                  const isPaymentPending = b.payment_status === 'Pending';

                  return (
                    <tr key={b.booking_id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-4 px-4 font-mono font-bold text-white">
                        #{b.booking_id}
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={b.car_image}
                            alt={`${b.brand} ${b.model}`}
                            className="w-12 h-9 object-cover rounded-lg bg-slate-950 shrink-0 border border-slate-800"
                          />
                          <div>
                            <div className="font-bold text-white">
                              {b.brand} {b.model}
                            </div>
                            <div className="text-[11px] text-slate-500 font-mono">
                              {b.registration_number}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1.5 text-slate-200">
                          <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                          <span className="font-medium truncate max-w-[150px]">{b.pickup_location || 'Airport Terminal 3, New Delhi'}</span>
                        </div>
                        {b.return_location && b.return_location !== b.pickup_location && (
                          <div className="text-[10px] text-slate-500 mt-0.5 truncate max-w-[150px]">
                            Drop: {b.return_location}
                          </div>
                        )}
                      </td>

                      <td className="py-4 px-4">
                        <div className="font-medium text-slate-200">{formatDate(b.pickup_date)} to {formatDate(b.return_date)}</div>
                        <div className="text-[10px] text-slate-500">{b.rental_days} day(s) rental</div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="font-black text-white text-sm">
                          {formatINR(b.total_amount)}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          ₹{Number(b.price_per_day).toLocaleString('en-IN')}/day
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <StatusBadge status={b.payment_status || 'Paid'} />
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          {b.payment_method || 'UPI'}
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <StatusBadge status={b.booking_status} />
                      </td>

                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View details / Invoice */}
                          <button
                            onClick={() => setDetailModalBooking(b)}
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                            title="View Invoice & Summary"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Pay Now Button (if pending) */}
                          {isPaymentPending && (
                            <button
                              onClick={() => handleOpenPay(b)}
                              className="px-2.5 py-1 text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-sm transition-all"
                            >
                              Pay Now
                            </button>
                          )}

                          {/* Cancel Button */}
                          {isEligibleForCancel && (
                            <button
                              onClick={() => handleOpenCancel(b)}
                              className="px-2.5 py-1 text-[11px] font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg border border-rose-500/20 transition-all"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 1. Cancellation Confirmation Modal */}
      {cancelModalOpen && bookingToCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                <XCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Cancel Reservation</h3>
                <p className="text-xs text-slate-400">
                  Booking #{bookingToCancel.booking_id} • {bookingToCancel.brand} {bookingToCancel.model}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-300">
              Are you sure you want to cancel this booking? This will immediately release the car back to the available fleet.
            </p>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Reason for cancellation (optional):
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="e.g. Change of travel plans, unexpected schedule change..."
                rows={3}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-colors"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCancelModalOpen(false)}
                disabled={cancelling}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                Keep Booking
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                disabled={cancelling}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 disabled:bg-rose-800 shadow-md shadow-rose-600/20 transition-all flex items-center gap-1.5"
              >
                {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Simulated Pay Now Modal */}
      {payModalOpen && bookingToPay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Complete Rental Payment</h3>
                  <div className="text-[11px] text-slate-400">Booking #{bookingToPay.booking_id}</div>
                </div>
              </div>
              <button onClick={() => setPayModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 block">Total Due Amount</span>
                <span className="text-xs font-bold text-white">{bookingToPay.brand} {bookingToPay.model}</span>
              </div>
              <div className="text-right">
                <span className="text-xl font-black text-emerald-400">{formatINR(bookingToPay.total_amount)}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2">
                Select Simulated Payment Method:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {['UPI', 'Card', 'Net Banking', 'Cash'].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setPaymentMethod(m)}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all text-left ${
                      paymentMethod === m
                        ? 'bg-blue-600/20 border-blue-500 text-white shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {m === 'UPI' && '📱 Google Pay / PhonePe'}
                    {m === 'Card' && '💳 Credit / Debit Card'}
                    {m === 'Net Banking' && '🏦 Net Banking'}
                    {m === 'Cash' && '💵 Pay at Pickup'}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleProcessPayment}
              disabled={paying}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 text-white font-bold text-xs shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2"
            >
              {paying ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span>Processing secure payment...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Pay {formatINR(bookingToPay.total_amount)}</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* 3. Detailed Summary / Invoice Modal */}
      {detailModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Rental Invoice Summary</h3>
                  <p className="text-xs text-slate-400">CRMS Tax Invoice #{detailModalBooking.booking_id}</p>
                </div>
              </div>
              <button
                onClick={() => setDetailModalBooking(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Car header */}
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <img
                src={detailModalBooking.car_image}
                alt={detailModalBooking.brand}
                className="w-20 h-14 object-cover rounded-xl bg-slate-900"
              />
              <div>
                <h4 className="text-sm font-bold text-white">
                  {detailModalBooking.brand} {detailModalBooking.model}
                </h4>
                <div className="text-xs text-slate-400 font-mono">
                  {detailModalBooking.registration_number}
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <StatusBadge status={detailModalBooking.booking_status} />
                  <span className="text-[11px] text-slate-500 font-medium">
                    Payment: {detailModalBooking.payment_status || 'Paid'}
                  </span>
                </div>
              </div>
            </div>

            {/* Location & Travel dates */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Pickup Location</span>
                <span className="font-bold text-white mt-1 block flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  {detailModalBooking.pickup_location || 'Airport Terminal 3, New Delhi'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Return Location</span>
                <span className="font-bold text-white mt-1 block flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  {detailModalBooking.return_location || detailModalBooking.pickup_location || 'Airport Terminal 3, New Delhi'}
                </span>
              </div>
            </div>

            {/* Travel dates */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Pickup Date</span>
                <span className="font-bold text-white mt-1 block">{formatDate(detailModalBooking.pickup_date)}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Return Date</span>
                <span className="font-bold text-white mt-1 block">{formatDate(detailModalBooking.return_date)}</span>
              </div>
            </div>

            {/* Price breakdown */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Rental Duration</span>
                <span className="text-white font-medium">{detailModalBooking.rental_days} day(s)</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Daily Rate</span>
                <span className="text-white font-medium">{formatINR(detailModalBooking.price_per_day)}/day</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Subtotal</span>
                <span className="text-white font-medium">{formatINR(detailModalBooking.subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>GST / Taxes (18%)</span>
                <span className="text-white font-medium">{formatINR(detailModalBooking.tax)}</span>
              </div>
              {Number(detailModalBooking.discount) > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Special Discount Applied</span>
                  <span>- {formatINR(detailModalBooking.discount)}</span>
                </div>
              )}
              <div className="pt-2 border-t border-slate-800 flex justify-between text-sm font-bold text-white">
                <span>Total Amount</span>
                <span className="text-blue-400">{formatINR(detailModalBooking.total_amount)}</span>
              </div>
            </div>

            {detailModalBooking.cancellation_reason && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                <span className="font-bold block">Cancellation Reason:</span>
                {detailModalBooking.cancellation_reason}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDetailModalBooking(null)}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
              >
                Close Summary
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerBookingsPage;
