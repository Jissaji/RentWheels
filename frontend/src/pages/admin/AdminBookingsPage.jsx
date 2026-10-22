import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  XCircle,
  PlayCircle,
  CheckCheck,
  Calendar,
  IndianRupee,
  User,
  Car,
  FileText,
  AlertCircle,
  X,
  Clock,
  Edit,
  MapPin,
  ShieldAlert
} from 'lucide-react';
import { bookingService } from '../../services/bookingService';
import { carService } from '../../services/carService';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import ConfirmationDialog from '../../components/ConfirmationDialog';
import { useToast } from '../../context/ToastContext';
import { formatINR, formatDate, formatDateTime } from '../../utils/formatters';

const LOCATIONS = [
  'Connaught Place, New Delhi',
  'IGI Airport Terminal 3, New Delhi',
  'Andheri West, Mumbai',
  'Chhatrapati Shivaji Airport, Mumbai',
  'Indiranagar, Bengaluru',
  'Kempegowda Airport, Bengaluru',
  'Banjara Hills, Hyderabad',
  'Malviya Nagar, Jaipur'
];

const AdminBookingsPage = () => {
  const { showToast } = useToast();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [availableCars, setAvailableCars] = useState([]);

  // Filters
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Modals
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [modifyModalOpen, setModifyModalOpen] = useState(false);
  const [bookingToModify, setBookingToModify] = useState(null);
  const [modifyForm, setModifyForm] = useState({
    car_id: '',
    pickup_location: '',
    return_location: '',
    pickup_date: '',
    return_date: '',
    special_requests: ''
  });
  const [modifyPricePreview, setModifyPricePreview] = useState(null);
  const [modifyError, setModifyError] = useState('');
  const [modifying, setModifying] = useState(false);

  // Cancellation state
  const [cancelReason, setCancelReason] = useState('');

  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'primary',
    action: null
  });

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const data = await bookingService.getAllBookings(params);
      setBookings(data.bookings || []);
    } catch (err) {
      console.error('Failed to load bookings:', err);
      showToast('Could not load bookings list.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllCars = async () => {
    try {
      const data = await carService.getAllCars();
      setAvailableCars(data.cars || []);
    } catch (err) {
      console.warn('Could not load fleet for modify selector:', err.message);
    }
  };

  useEffect(() => {
    fetchBookings();
    fetchAllCars();
  }, [statusFilter, startDate, endDate]);

  const handleUpdateStatus = (bookingId, newStatus, reason = null) => {
    let actionTitle = '';
    let actionMessage = '';
    let dialogType = 'primary';

    if (newStatus === 'Confirmed') {
      actionTitle = 'Approve Booking';
      actionMessage = `Approve booking #${bookingId}? The customer will be verified and in-app notification sent.`;
      dialogType = 'primary';
    } else if (newStatus === 'Active') {
      actionTitle = 'Mark as Active / Vehicle Picked Up';
      actionMessage = `Mark booking #${bookingId} as Active? This records that the customer has picked up the vehicle.`;
      dialogType = 'primary';
    } else if (newStatus === 'Completed') {
      actionTitle = 'Mark as Completed / Vehicle Returned';
      actionMessage = `Mark booking #${bookingId} as Completed? The vehicle inspection is finished and the car will be returned to the Available fleet.`;
      dialogType = 'primary';
    } else if (newStatus === 'Rejected') {
      actionTitle = 'Reject Booking';
      actionMessage = `Reject booking #${bookingId}? This will cancel the reservation and release the car.`;
      dialogType = 'danger';
    } else if (newStatus === 'Cancelled') {
      actionTitle = 'Cancel Booking';
      actionMessage = `Cancel booking #${bookingId}? Any pre-paid payments will be marked for refund.`;
      dialogType = 'danger';
    }

    setConfirmDialog({
      isOpen: true,
      title: actionTitle,
      message: actionMessage,
      type: dialogType,
      action: async () => {
        try {
          await bookingService.updateBookingStatus(bookingId, newStatus, reason);
          showToast(`Booking #${bookingId} status updated to ${newStatus}.`, 'success');
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
          if (selectedBooking && selectedBooking.booking_id === bookingId) {
            setSelectedBooking((prev) => ({ ...prev, booking_status: newStatus }));
          }
          fetchBookings();
        } catch (err) {
          const msg = err.response?.data?.message || 'Failed to update booking status.';
          showToast(msg, 'error');
        }
      }
    });
  };

  // Open Modify Modal
  const handleOpenModify = (b) => {
    setBookingToModify(b);
    setModifyForm({
      car_id: b.car_id,
      pickup_location: b.pickup_location || 'Connaught Place, New Delhi',
      return_location: b.return_location || 'Connaught Place, New Delhi',
      pickup_date: b.pickup_date,
      return_date: b.return_date,
      special_requests: b.special_requests || ''
    });
    setModifyError('');
    setModifyPricePreview(null);
    setModifyModalOpen(true);
  };

  // Live recalculate for modify modal
  useEffect(() => {
    if (!modifyModalOpen || !modifyForm.car_id || !modifyForm.pickup_date || !modifyForm.return_date) return;

    if (modifyForm.return_date < modifyForm.pickup_date) {
      setModifyError('Return date cannot be earlier than pickup date.');
      setModifyPricePreview(null);
      return;
    }

    const calcTimer = setTimeout(async () => {
      try {
        setModifyError('');
        const res = await bookingService.calculatePrice({
          car_id: modifyForm.car_id,
          pickup_date: modifyForm.pickup_date,
          return_date: modifyForm.return_date
        });
        setModifyPricePreview(res.calculation);
      } catch (err) {
        setModifyError(err.response?.data?.message || 'Date selection error.');
        setModifyPricePreview(null);
      }
    }, 250);

    return () => clearTimeout(calcTimer);
  }, [modifyForm.car_id, modifyForm.pickup_date, modifyForm.return_date, modifyModalOpen]);

  const handleSaveModify = async (e) => {
    e.preventDefault();
    if (!bookingToModify) return;
    if (modifyError) return;

    setModifying(true);
    try {
      await bookingService.modifyBooking(bookingToModify.booking_id, modifyForm);
      showToast(`Booking #${bookingToModify.booking_id} modified successfully.`, 'success');
      setModifyModalOpen(false);
      setBookingToModify(null);
      fetchBookings();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to modify booking.';
      setModifyError(msg);
      showToast(msg, 'error');
    } finally {
      setModifying(false);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      b.booking_id.toString().includes(term) ||
      (b.customer_name && b.customer_name.toLowerCase().includes(term)) ||
      (b.customer_email && b.customer_email.toLowerCase().includes(term)) ||
      (b.customer_phone && b.customer_phone.toLowerCase().includes(term)) ||
      (b.brand && b.brand.toLowerCase().includes(term)) ||
      (b.model && b.model.toLowerCase().includes(term)) ||
      (b.registration_number && b.registration_number.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <CalendarCheck className="w-6 h-6 text-indigo-500" />
            Booking & Reservation Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Review customer bookings, approve reservations, modify dates/vehicles, dispatch fleet, and track status.
          </p>
        </div>

        <button
          onClick={fetchBookings}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all self-start sm:self-auto"
        >
          Refresh Bookings
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-3">
          {/* Search box */}
          <div className="relative w-full lg:w-96">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search by customer, car, plate, booking ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            {/* Status selector */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="Pending">Pending Approval</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Active">Active (Ongoing)</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Rejected">Rejected</option>
            </select>

            {/* Date range inputs */}
            <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1 text-xs text-slate-400">
              <span className="text-[10px] uppercase font-semibold text-slate-500">From</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent text-white text-xs focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1 text-xs text-slate-400">
              <span className="text-[10px] uppercase font-semibold text-slate-500">To</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-transparent text-white text-xs focus:outline-none"
              />
            </div>

            {(statusFilter !== 'ALL' || startDate || endDate || searchTerm) && (
              <button
                onClick={() => {
                  setStatusFilter('ALL');
                  setStartDate('');
                  setEndDate('');
                  setSearchTerm('');
                }}
                className="text-xs text-indigo-400 hover:text-indigo-300 px-2 py-1 font-semibold"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      {loading ? (
        <LoadingSpinner message="Loading reservation records..." />
      ) : filteredBookings.length === 0 ? (
        <EmptyState
          title="No bookings match criteria"
          description="Try adjusting your status filter, search query, or date range."
        />
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Booking ID</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Car & Category</th>
                  <th className="py-3.5 px-4">Rental Period & Hub</th>
                  <th className="py-3.5 px-4">Total Amount</th>
                  <th className="py-3.5 px-4">Payment</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Workflow Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredBookings.map((b) => (
                  <tr key={b.booking_id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-white">
                      #{b.booking_id}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white">{b.customer_name}</div>
                      <div className="text-[11px] text-slate-400">{b.customer_phone || b.customer_email}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white">
                        {b.brand} {b.model}
                      </div>
                      <div className="text-[10px] text-indigo-400 font-mono">
                        {b.registration_number} {b.category ? `• ${b.category}` : ''}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-slate-200">
                        {formatDate(b.pickup_date)} &rarr; {formatDate(b.return_date)}
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-blue-400 shrink-0" />
                        <span className="truncate max-w-[150px]">{b.pickup_location || 'Connaught Place, New Delhi'}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-black text-white text-sm">
                        {formatINR(b.total_amount)}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">{b.rental_days} day(s)</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <StatusBadge status={b.payment_status || 'Paid'} />
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {b.payment_method || 'UPI'}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <StatusBadge status={b.booking_status} />
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* View Details modal */}
                        <button
                          onClick={() => setSelectedBooking(b)}
                          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                          title="View Full Booking Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Modify eligible booking (User Story 4) */}
                        {['Pending', 'Confirmed'].includes(b.booking_status) && (
                          <button
                            onClick={() => handleOpenModify(b)}
                            className="p-1.5 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 rounded-lg transition-colors"
                            title="Modify Booking Details / Dates"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}

                        {/* If Pending: Approve or Reject */}
                        {b.booking_status === 'Pending' && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(b.booking_id, 'Confirmed')}
                              className="px-2 py-1 text-[11px] font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-sm transition-all"
                              title="Approve Booking"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(b.booking_id, 'Rejected', 'Rejected by administrator')}
                              className="px-2 py-1 text-[11px] font-semibold text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
                              title="Reject Booking"
                            >
                              Reject
                            </button>
                          </>
                        )}

                        {/* If Confirmed: Mark Active (Customer picked up car) */}
                        {b.booking_status === 'Confirmed' && (
                          <button
                            onClick={() => handleUpdateStatus(b.booking_id, 'Active')}
                            className="px-2.5 py-1 text-[11px] font-bold text-white bg-purple-600 hover:bg-purple-500 rounded-lg shadow-sm transition-all flex items-center gap-1"
                            title="Dispatch car to customer"
                          >
                            <PlayCircle className="w-3.5 h-3.5" />
                            Dispatch
                          </button>
                        )}

                        {/* If Active: Mark Completed (Customer returned car) */}
                        {b.booking_status === 'Active' && (
                          <button
                            onClick={() => handleUpdateStatus(b.booking_id, 'Completed')}
                            className="px-2.5 py-1 text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-sm transition-all flex items-center gap-1"
                            title="Vehicle return inspection complete"
                          >
                            <CheckCheck className="w-3.5 h-3.5" />
                            Return
                          </button>
                        )}

                        {/* Cancel option for eligible bookings */}
                        {['Pending', 'Confirmed'].includes(b.booking_status) && (
                          <button
                            onClick={() => handleUpdateStatus(b.booking_id, 'Cancelled', 'Cancelled by administrator')}
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

      {/* Modify Booking Modal (User Story 4) */}
      {modifyModalOpen && bookingToModify && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-600/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
                  <Edit className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Modify Booking #{bookingToModify.booking_id}</h3>
                  <p className="text-xs text-slate-400">Customer: {bookingToModify.customer_name}</p>
                </div>
              </div>
              <button onClick={() => setModifyModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {modifyError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{modifyError}</span>
              </div>
            )}

            <form onSubmit={handleSaveModify} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Assigned Vehicle
                </label>
                <select
                  value={modifyForm.car_id}
                  onChange={(e) => setModifyForm({ ...modifyForm, car_id: parseInt(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  {availableCars.map((c) => (
                    <option key={c.car_id} value={c.car_id}>
                      {c.brand} {c.model} ({c.registration_number}) - ₹{c.price_per_day}/day - {c.status}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Pickup Location
                  </label>
                  <select
                    value={modifyForm.pickup_location}
                    onChange={(e) => setModifyForm({ ...modifyForm, pickup_location: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    {LOCATIONS.map(loc => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Return Location
                  </label>
                  <select
                    value={modifyForm.return_location}
                    onChange={(e) => setModifyForm({ ...modifyForm, return_location: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    {LOCATIONS.map(loc => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Pickup Date
                  </label>
                  <input
                    type="date"
                    required
                    value={modifyForm.pickup_date}
                    onChange={(e) => setModifyForm({ ...modifyForm, pickup_date: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Return Date
                  </label>
                  <input
                    type="date"
                    required
                    min={modifyForm.pickup_date}
                    value={modifyForm.return_date}
                    onChange={(e) => setModifyForm({ ...modifyForm, return_date: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Special Requests / Admin Notes
                </label>
                <textarea
                  rows={2}
                  value={modifyForm.special_requests}
                  onChange={(e) => setModifyForm({ ...modifyForm, special_requests: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Dynamic Price Preview */}
              {modifyPricePreview && (
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1.5">
                  <div className="flex justify-between text-slate-400">
                    <span>Re-calculated Duration:</span>
                    <span className="font-semibold text-white">{modifyPricePreview.rental_days} Days</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Base Fare + 18% GST:</span>
                    <span className="font-semibold text-white">₹{modifyPricePreview.subtotal} + ₹{modifyPricePreview.tax}</span>
                  </div>
                  <div className="flex justify-between text-indigo-400 font-bold pt-1 border-t border-slate-800">
                    <span>Updated Total:</span>
                    <span>{formatINR(modifyPricePreview.total_amount)}</span>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModifyModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modifying || Boolean(modifyError)}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 shadow-md shadow-indigo-600/20"
                >
                  {modifying ? 'Saving...' : 'Apply Modifications'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-600/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Booking #{selectedBooking.booking_id} Details</h3>
                  <div className="text-[11px] text-slate-400">Created: {formatDateTime(selectedBooking.created_at)}</div>
                </div>
              </div>
              <button onClick={() => setSelectedBooking(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Customer Details Card */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <User className="w-4 h-4 text-blue-400" />
                Customer Profile
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
                <div>
                  <span className="text-slate-500 block">Name:</span>
                  <span className="font-semibold text-white">{selectedBooking.customer_name}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Email:</span>
                  <span>{selectedBooking.customer_email}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Phone:</span>
                  <span>{selectedBooking.customer_phone || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Driving License:</span>
                  <span className="font-mono">{selectedBooking.driving_license || 'DL-ON-FILE'}</span>
                </div>
              </div>
            </div>

            {/* Vehicle Details */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-4">
              <img
                src={selectedBooking.car_image}
                alt={selectedBooking.model}
                className="w-20 h-14 object-cover rounded-xl bg-slate-900 border border-slate-800"
              />
              <div className="text-xs">
                <h4 className="font-bold text-white text-sm">
                  {selectedBooking.brand} {selectedBooking.model}
                </h4>
                <div className="text-indigo-400 font-mono mt-0.5">
                  Plate: {selectedBooking.registration_number}
                </div>
                <div className="text-slate-400 mt-1">
                  Daily Rate: {formatINR(selectedBooking.price_per_day)}/day
                </div>
              </div>
            </div>

            {/* Location & Schedule */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Pickup Location</span>
                <span className="font-bold text-white mt-1 block">{selectedBooking.pickup_location || 'Connaught Place, New Delhi'}</span>
                <span className="text-[11px] text-slate-400 mt-0.5 block">{formatDate(selectedBooking.pickup_date)}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Return Location</span>
                <span className="font-bold text-white mt-1 block">{selectedBooking.return_location || 'Connaught Place, New Delhi'}</span>
                <span className="text-[11px] text-slate-400 mt-0.5 block">{formatDate(selectedBooking.return_date)}</span>
              </div>
            </div>

            {/* Financial Breakdown */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Rental Duration</span>
                <span className="text-white font-medium">{selectedBooking.rental_days} day(s)</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Subtotal</span>
                <span className="text-white">{formatINR(selectedBooking.subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>GST (18%)</span>
                <span className="text-white">{formatINR(selectedBooking.tax)}</span>
              </div>
              {Number(selectedBooking.discount) > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Discount</span>
                  <span>- {formatINR(selectedBooking.discount)}</span>
                </div>
              )}
              <div className="pt-2 border-t border-slate-800 flex justify-between text-sm font-bold text-white">
                <span>Total Amount</span>
                <span className="text-indigo-400">{formatINR(selectedBooking.total_amount)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Current Status:</span>
                <StatusBadge status={selectedBooking.booking_status} />
              </div>

              <div className="flex items-center gap-2">
                {selectedBooking.booking_status === 'Pending' && (
                  <button
                    onClick={() => handleUpdateStatus(selectedBooking.booking_id, 'Confirmed')}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 transition-all"
                  >
                    Approve
                  </button>
                )}
                {selectedBooking.booking_status === 'Confirmed' && (
                  <button
                    onClick={() => handleUpdateStatus(selectedBooking.booking_id, 'Active')}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 transition-all"
                  >
                    Dispatch Car
                  </button>
                )}
                {selectedBooking.booking_status === 'Active' && (
                  <button
                    onClick={() => handleUpdateStatus(selectedBooking.booking_id, 'Completed')}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-all"
                  >
                    Mark Returned
                  </button>
                )}
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDialog.action}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type={confirmDialog.type}
      />
    </div>
  );
};

export default AdminBookingsPage;
