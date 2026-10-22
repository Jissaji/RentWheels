import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CalendarCheck, Eye, XCircle, Car, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';
import { bookingService } from '../../services/bookingService';
import { useToast } from '../../context/ToastContext';
import StatusBadge from '../../components/StatusBadge';
import ConfirmationDialog from '../../components/ConfirmationDialog';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { formatINR, formatDate } from '../../utils/formatters';

const MyBookingsPage = () => {
  const { showToast } = useToast();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal / action state
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const data = await bookingService.getMyBookings();
      setBookings(data.bookings || []);
    } catch (err) {
      showToast('Failed to load bookings', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleOpenCancel = (b) => {
    setBookingToCancel(b);
    setCancelReason('');
    setIsCancelOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!bookingToCancel) return;
    setActionLoading(true);
    try {
      await bookingService.cancelBooking(bookingToCancel.booking_id, cancelReason || 'Cancelled by customer');
      showToast('Booking cancelled successfully.', 'success');
      setIsCancelOpen(false);
      setBookingToCancel(null);
      fetchBookings();
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not cancel booking.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const isCancellable = (booking) => {
    return (
      (booking.booking_status === 'Pending' || booking.booking_status === 'Confirmed') &&
      new Date(booking.pickup_date) >= new Date(new Date().toISOString().split('T')[0])
    );
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <CalendarCheck className="w-3.5 h-3.5" />
            Reservation Management
          </div>
          <h1 className="text-2xl font-black text-white">My Bookings</h1>
          <p className="text-xs text-slate-400">
            View booking status, invoice breakdowns, and manage upcoming road trip reservations.
          </p>
        </div>

        <Link
          to="/cars"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-blue-600/20 transition-all self-start sm:self-auto"
        >
          <Car className="w-4 h-4" />
          Rent New Car
        </Link>
      </div>

      {loading ? (
        <LoadingSpinner message="Retrieving your bookings..." />
      ) : bookings.length === 0 ? (
        <EmptyState
          icon={CalendarCheck}
          title="No bookings yet"
          description="You haven't made any car reservations yet. Explore our fleet and book your first drive!"
          actionLabel="Browse Available Cars"
          onAction={() => window.location.href = '/cars'}
        />
      ) : (
        <div className="rounded-3xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-4 px-4 sm:px-6">Booking ID</th>
                  <th className="py-4 px-4 sm:px-6">Car</th>
                  <th className="py-4 px-4 sm:px-6">Pickup Date</th>
                  <th className="py-4 px-4 sm:px-6">Return Date</th>
                  <th className="py-4 px-4 sm:px-6">Total Amount</th>
                  <th className="py-4 px-4 sm:px-6">Payment</th>
                  <th className="py-4 px-4 sm:px-6">Status</th>
                  <th className="py-4 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {bookings.map((b) => (
                  <tr key={b.booking_id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-4 sm:px-6 font-mono font-bold text-blue-400">
                      #{b.booking_id}
                    </td>
                    <td className="py-4 px-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={b.car_image}
                          alt={b.model}
                          className="w-12 h-9 rounded-lg object-cover shrink-0 bg-slate-950"
                        />
                        <div>
                          <div className="font-bold text-white">{b.brand} {b.model}</div>
                          <div className="text-[11px] font-mono text-slate-400">{b.registration_number}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 sm:px-6 text-slate-300 font-medium">
                      {formatDate(b.pickup_date)}
                    </td>
                    <td className="py-4 px-4 sm:px-6 text-slate-300 font-medium">
                      {formatDate(b.return_date)}
                    </td>
                    <td className="py-4 px-4 sm:px-6 font-extrabold text-white">
                      {formatINR(b.total_amount)}
                    </td>
                    <td className="py-4 px-4 sm:px-6">
                      <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        {b.payment_status || 'Paid'}
                      </span>
                    </td>
                    <td className="py-4 px-4 sm:px-6">
                      <StatusBadge status={b.booking_status} />
                    </td>
                    <td className="py-4 px-4 sm:px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedBooking(b);
                            setIsDetailOpen(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                          title="View Details & Receipt"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {isCancellable(b) && (
                          <button
                            onClick={() => handleOpenCancel(b)}
                            className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors"
                            title="Cancel Booking"
                          >
                            <XCircle className="w-4 h-4" />
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

      {/* Booking Details / Invoice Modal */}
      {isDetailOpen && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 overflow-hidden space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-bold text-white">Booking #{selectedBooking.booking_id} Invoice</h3>
              </div>
              <button
                onClick={() => setIsDetailOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-950 border border-slate-800">
                <img
                  src={selectedBooking.car_image}
                  alt={selectedBooking.model}
                  className="w-16 h-12 rounded-xl object-cover shrink-0"
                />
                <div>
                  <div className="font-bold text-white text-sm">{selectedBooking.brand} {selectedBooking.model}</div>
                  <div className="text-slate-400">Reg: {selectedBooking.registration_number}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
                <div>
                  <span className="text-slate-400 block">Pickup Date</span>
                  <span className="font-bold text-white">{selectedBooking.pickup_date}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Return Date</span>
                  <span className="font-bold text-white">{selectedBooking.return_date}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Rental Days</span>
                  <span className="font-bold text-white">{selectedBooking.rental_days} Days</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Booking Status</span>
                  <StatusBadge status={selectedBooking.booking_status} />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="flex justify-between text-slate-400">
                  <span>Base Fare ({selectedBooking.rental_days} × {formatINR(selectedBooking.price_per_day)})</span>
                  <span className="text-white font-semibold">{formatINR(selectedBooking.subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>GST (18%)</span>
                  <span className="text-white font-semibold">{formatINR(selectedBooking.tax)}</span>
                </div>
                {selectedBooking.discount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Discount Applied</span>
                    <span className="font-semibold">-{formatINR(selectedBooking.discount)}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-slate-800 flex justify-between font-bold text-sm">
                  <span className="text-white">Total Amount</span>
                  <span className="text-blue-400 font-extrabold">{formatINR(selectedBooking.total_amount)}</span>
                </div>
              </div>

              {selectedBooking.cancellation_reason && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                  <span className="font-bold block">Cancellation Note:</span>
                  {selectedBooking.cancellation_reason}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setIsDetailOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog for Cancellation */}
      <ConfirmationDialog
        isOpen={isCancelOpen}
        title="Cancel This Booking?"
        message={`Are you sure you want to cancel booking #${bookingToCancel?.booking_id} for ${bookingToCancel?.brand} ${bookingToCancel?.model}? Payment will be refunded.`}
        confirmLabel="Yes, Cancel Booking"
        confirmVariant="danger"
        loading={actionLoading}
        onConfirm={handleConfirmCancel}
        onCancel={() => setIsCancelOpen(false)}
      />
    </div>
  );
};

export default MyBookingsPage;
