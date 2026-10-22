import React, { useState, useEffect } from 'react';
import {
  ClipboardCheck,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Car,
  User,
  Gauge,
  Calendar,
  FileText,
  ShieldAlert,
  ArrowRight,
  RotateCcw,
  PlusCircle,
  X,
  MapPin,
  IndianRupee,
  History
} from 'lucide-react';
import { rentalRecordService } from '../../services/rentalRecordService';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { formatINR, formatDate, formatDateTime } from '../../utils/formatters';

const getNowDateTimeString = () => {
  const d = new Date();
  return d.toISOString().replace('T', ' ').substring(0, 19);
};

const StaffPickupReturnPage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('pickups'); // 'pickups', 'returns', 'history'
  const [loading, setLoading] = useState(true);

  const [pendingPickups, setPendingPickups] = useState([]);
  const [activeReturns, setActiveReturns] = useState([]);
  const [historyRecords, setHistoryRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Handover (Pickup) Modal state
  const [pickupModalOpen, setPickupModalOpen] = useState(false);
  const [selectedPickupBooking, setSelectedPickupBooking] = useState(null);
  const [pickupOdometer, setPickupOdometer] = useState('');
  const [pickupCondition, setPickupCondition] = useState('Vehicle 40-point safety checklist passed. Exterior clean, full fuel tank, spare tire and toolkit verified.');
  const [submittingPickup, setSubmittingPickup] = useState(false);

  // Return Modal state
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [selectedReturnBooking, setSelectedReturnBooking] = useState(null);
  const [returnOdometer, setReturnOdometer] = useState('');
  const [returnCondition, setReturnCondition] = useState('Returned in good mechanical condition. Interior sanitized.');
  const [damageReported, setDamageReported] = useState(false);
  const [damageNotes, setDamageNotes] = useState('');
  const [damageFee, setDamageFee] = useState('0');
  const [additionalCharges, setAdditionalCharges] = useState('0');
  const [sendToMaintenance, setSendToMaintenance] = useState(false);
  const [submittingReturn, setSubmittingReturn] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pickupsRes, returnsRes, historyRes] = await Promise.all([
        rentalRecordService.getPendingPickups(),
        rentalRecordService.getActiveReturns(),
        rentalRecordService.getAllRecords()
      ]);
      setPendingPickups(pickupsRes.bookings || []);
      setActiveReturns(returnsRes.bookings || []);
      setHistoryRecords(historyRes.records || []);
    } catch (err) {
      console.error('Failed to load staff rental operations:', err);
      showToast('Could not load rental handover records.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handover (Pickup) Handlers
  const handleOpenPickup = (booking) => {
    setSelectedPickupBooking(booking);
    setPickupOdometer('15000');
    setPickupCondition('Vehicle 40-point safety checklist passed. Exterior clean, full fuel tank, spare tire and toolkit verified.');
    setPickupModalOpen(true);
  };

  const handleProcessPickup = async (e) => {
    e.preventDefault();
    if (!selectedPickupBooking) return;
    setSubmittingPickup(true);

    try {
      await rentalRecordService.processPickup({
        booking_id: selectedPickupBooking.booking_id,
        pickup_odometer: parseInt(pickupOdometer) || 0,
        pickup_condition: pickupCondition,
        pickup_time: getNowDateTimeString()
      });

      showToast(`Vehicle handover logged! Booking #${selectedPickupBooking.booking_id} is now Active.`, 'success');
      setPickupModalOpen(false);
      setSelectedPickupBooking(null);
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to process pickup handover.', 'error');
    } finally {
      setSubmittingPickup(false);
    }
  };

  // Return Handlers
  const handleOpenReturn = (booking) => {
    setSelectedReturnBooking(booking);
    setReturnOdometer(booking.pickup_odometer ? (booking.pickup_odometer + 450).toString() : '15500');
    setReturnCondition('Returned in good mechanical condition. Interior sanitized.');
    setDamageReported(false);
    setDamageNotes('');
    setDamageFee('0');
    setAdditionalCharges('0');
    setSendToMaintenance(false);
    setReturnModalOpen(true);
  };

  const handleProcessReturn = async (e) => {
    e.preventDefault();
    if (!selectedReturnBooking) return;
    setSubmittingReturn(true);

    try {
      await rentalRecordService.processReturn({
        booking_id: selectedReturnBooking.booking_id,
        return_time: getNowDateTimeString(),
        return_odometer: parseInt(returnOdometer) || 0,
        return_condition: returnCondition,
        damage_reported: damageReported,
        damage_notes: damageNotes,
        damage_fee: parseFloat(damageFee) || 0,
        additional_charges: parseFloat(additionalCharges) || 0,
        send_to_maintenance: sendToMaintenance || damageReported
      });

      showToast(
        `Vehicle return verified! Booking #${selectedReturnBooking.booking_id} marked as Completed. Vehicle set to ${damageReported || sendToMaintenance ? 'Maintenance' : 'Available'}.`,
        'success'
      );
      setReturnModalOpen(false);
      setSelectedReturnBooking(null);
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to record return.', 'error');
    } finally {
      setSubmittingReturn(false);
    }
  };

  // Filtered lists
  const filteredPickups = pendingPickups.filter(b => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      b.booking_id.toString().includes(term) ||
      b.customer_name?.toLowerCase().includes(term) ||
      b.brand?.toLowerCase().includes(term) ||
      b.model?.toLowerCase().includes(term) ||
      b.registration_number?.toLowerCase().includes(term)
    );
  });

  const filteredReturns = activeReturns.filter(b => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      b.booking_id.toString().includes(term) ||
      b.customer_name?.toLowerCase().includes(term) ||
      b.brand?.toLowerCase().includes(term) ||
      b.model?.toLowerCase().includes(term) ||
      b.registration_number?.toLowerCase().includes(term)
    );
  });

  const filteredHistory = historyRecords.filter(r => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      r.record_id.toString().includes(term) ||
      r.booking_id.toString().includes(term) ||
      r.customer_name?.toLowerCase().includes(term) ||
      r.staff_name?.toLowerCase().includes(term) ||
      r.brand?.toLowerCase().includes(term) ||
      r.model?.toLowerCase().includes(term) ||
      r.registration_number?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <ClipboardCheck className="w-3.5 h-3.5" />
            Operations Desk • Staff Handover & Return Management
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Vehicle Dispatch & Check-in Control
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Logged in as staff member: <span className="font-semibold text-white">{user?.name}</span> ({user?.role})
          </p>
        </div>

        <button
          onClick={fetchData}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold border border-slate-800 transition-all self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Refresh Desk
        </button>
      </div>

      {/* Tabs and Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setActiveTab('pickups')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'pickups'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Clock className="w-4 h-4" />
            Pending Handover ({pendingPickups.length})
          </button>

          <button
            onClick={() => setActiveTab('returns')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'returns'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            Active Rentals Awaiting Return ({activeReturns.length})
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'history'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <History className="w-4 h-4" />
            Handover Log ({historyRecords.length})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search booking ID, customer, plate..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <LoadingSpinner message="Loading rental operations..." />
      ) : activeTab === 'pickups' ? (
        /* 1. PENDING PICKUPS */
        filteredPickups.length === 0 ? (
          <EmptyState
            title="No pending handovers"
            description="There are currently no confirmed bookings waiting for customer vehicle handover."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPickups.map((b) => (
              <div
                key={b.booking_id}
                className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-[16/9] bg-slate-950 overflow-hidden">
                    <img
                      src={b.car_image}
                      alt={b.model}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 bg-blue-600/90 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-lg backdrop-blur">
                      Booking #{b.booking_id}
                    </div>
                    <div className="absolute top-3 right-3">
                      <StatusBadge status={b.booking_status} />
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <div>
                      <span className="text-xs font-semibold text-blue-400 uppercase">{b.brand}</span>
                      <h3 className="text-lg font-bold text-white">{b.model}</h3>
                      <span className="text-xs font-mono text-slate-400">{b.registration_number}</span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5 text-xs text-slate-300">
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                        <span className="font-semibold text-white">{b.customer_name}</span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Phone: {b.customer_phone || 'N/A'} • License: {b.driving_license || 'DL-ON-FILE'}
                      </div>
                      <div className="flex items-center gap-1.5 pt-1 border-t border-slate-800 text-[11px] text-slate-400">
                        <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                        <span className="truncate">{b.pickup_location || 'Connaught Place, New Delhi'}</span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Scheduled: {formatDate(b.pickup_date)} → {formatDate(b.return_date)} ({b.rental_days} days)
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <button
                    onClick={() => handleOpenPickup(b)}
                    className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 transition-all"
                  >
                    <ClipboardCheck className="w-4 h-4" />
                    Record Handover & Activate
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : activeTab === 'returns' ? (
        /* 2. ACTIVE RETURNS */
        filteredReturns.length === 0 ? (
          <EmptyState
            title="No active rentals pending return"
            description="All dispatched vehicles have been safely checked in or no bookings are currently marked active."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReturns.map((b) => (
              <div
                key={b.booking_id}
                className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-[16/9] bg-slate-950 overflow-hidden">
                    <img
                      src={b.car_image}
                      alt={b.model}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 bg-purple-600/90 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-lg backdrop-blur">
                      Booking #{b.booking_id}
                    </div>
                    <div className="absolute top-3 right-3">
                      <StatusBadge status={b.booking_status} />
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <div>
                      <span className="text-xs font-semibold text-purple-400 uppercase">{b.brand}</span>
                      <h3 className="text-lg font-bold text-white">{b.model}</h3>
                      <span className="text-xs font-mono text-slate-400">{b.registration_number}</span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5 text-xs text-slate-300">
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                        <span className="font-semibold text-white">{b.customer_name}</span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Phone: {b.customer_phone || 'N/A'}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Pickup Odometer: <span className="font-mono text-white font-semibold">{b.pickup_odometer || 0} km</span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Return Due: <span className="text-amber-400 font-semibold">{formatDate(b.return_date)}</span>
                      </div>
                      {b.pickup_staff_name && (
                        <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-800">
                          Handed over by: {b.pickup_staff_name}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <button
                    onClick={() => handleOpenReturn(b)}
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Process Vehicle Return
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* 3. HANDOVER HISTORY LOG */
        <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Record ID</th>
                  <th className="py-3.5 px-4">Booking</th>
                  <th className="py-3.5 px-4">Vehicle</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Handover (Staff)</th>
                  <th className="py-3.5 px-4">Return Inspection</th>
                  <th className="py-3.5 px-4">Damage / Extra Fee</th>
                  <th className="py-3.5 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredHistory.map((r) => (
                  <tr key={r.record_id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-400">
                      #{r.record_id}
                    </td>

                    <td className="py-3.5 px-4 font-mono font-semibold text-white">
                      #{r.booking_id}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white">{r.brand} {r.model}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{r.registration_number}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white">{r.customer_name}</div>
                      <div className="text-[10px] text-slate-400">{r.customer_phone || r.customer_email}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-slate-200">{formatDateTime(r.pickup_time)}</div>
                      <div className="text-[10px] text-slate-400">
                        Odometer: {r.pickup_odometer} km • Staff: {r.staff_name}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      {r.return_time ? (
                        <>
                          <div className="text-slate-200">{formatDateTime(r.return_time)}</div>
                          <div className="text-[10px] text-slate-400">
                            Odometer: {r.return_odometer} km
                          </div>
                        </>
                      ) : (
                        <span className="text-[11px] text-amber-400 font-medium">Currently in transit</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      {Boolean(r.damage_reported) ? (
                        <div>
                          <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                            Damage: {formatINR(r.damage_fee)}
                          </span>
                          {r.damage_notes && <div className="text-[10px] text-slate-400 mt-1 truncate max-w-xs">{r.damage_notes}</div>}
                        </div>
                      ) : (
                        <span className="text-[11px] text-emerald-400">Zero Damage</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        r.status === 'Returned'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      }`}>
                        {r.status === 'Returned' ? 'Returned' : 'In Progress'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Handover (Pickup) Modal */}
      {pickupModalOpen && selectedPickupBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600/15 border border-blue-500/30 text-blue-400 flex items-center justify-center">
                  <ClipboardCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Record Vehicle Handover</h3>
                  <p className="text-xs text-slate-400">Booking #{selectedPickupBooking.booking_id} • {selectedPickupBooking.brand} {selectedPickupBooking.model}</p>
                </div>
              </div>
              <button onClick={() => setPickupModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Customer Verification Box */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
              <div className="text-[11px] text-blue-400 font-bold uppercase tracking-wider">Driver Identity Check</div>
              <div className="text-white font-semibold">{selectedPickupBooking.customer_name} ({selectedPickupBooking.customer_phone})</div>
              <div className="text-slate-400">License: <span className="font-mono text-white">{selectedPickupBooking.driving_license || 'DL-ON-FILE'}</span></div>
            </div>

            <form onSubmit={handleProcessPickup} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Gauge className="w-3.5 h-3.5 text-blue-400" />
                  Initial Odometer Reading (km) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={pickupOdometer}
                  onChange={(e) => setPickupOdometer(e.target.value)}
                  placeholder="e.g. 15200"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Pre-Handover Vehicle Condition Checklist
                </label>
                <textarea
                  rows={3}
                  required
                  value={pickupCondition}
                  onChange={(e) => setPickupCondition(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300">
                Submitting this form records staff ID <span className="font-bold text-white">{user?.name}</span>, updates booking to <span className="font-bold text-white">Active</span>, and sets car status to <span className="font-bold text-white">Rented</span>.
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setPickupModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingPickup}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-600/20 disabled:opacity-50"
                >
                  {submittingPickup ? 'Recording...' : 'Confirm Handover to Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Return & Inspection Modal */}
      {returnModalOpen && selectedReturnBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-600/15 border border-purple-500/30 text-purple-400 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Process Vehicle Return</h3>
                  <p className="text-xs text-slate-400">Booking #{selectedReturnBooking.booking_id} • {selectedReturnBooking.brand} {selectedReturnBooking.model}</p>
                </div>
              </div>
              <button onClick={() => setReturnModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleProcessReturn} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Gauge className="w-3.5 h-3.5 text-purple-400" />
                  Return Odometer Reading (km) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={returnOdometer}
                  onChange={(e) => setReturnOdometer(e.target.value)}
                  placeholder="e.g. 15750"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Vehicle Condition Check After Return
                </label>
                <textarea
                  rows={2}
                  required
                  value={returnCondition}
                  onChange={(e) => setReturnCondition(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Damage & Maintenance reporting */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label htmlFor="damageReportedToggle" className="text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    Report Damage / Incident
                  </label>
                  <input
                    type="checkbox"
                    id="damageReportedToggle"
                    checked={damageReported}
                    onChange={(e) => {
                      setDamageReported(e.target.checked);
                      if (e.target.checked) setSendToMaintenance(true);
                    }}
                    className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-slate-700 bg-slate-900"
                  />
                </div>

                {damageReported && (
                  <div className="space-y-3 pt-2 border-t border-slate-800 animate-fade-in">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Damage Description & Incident Report
                      </label>
                      <textarea
                        rows={2}
                        value={damageNotes}
                        onChange={(e) => setDamageNotes(e.target.value)}
                        placeholder="Detail scratch, dent, tyre puncture, or electrical issue..."
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">
                          Damage Repair Fee (₹)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={damageFee}
                          onChange={(e) => setDamageFee(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">
                          Fuel / Late Surcharge (₹)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={additionalCharges}
                          onChange={(e) => setAdditionalCharges(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                  <input
                    type="checkbox"
                    id="sendMaintenanceCheck"
                    checked={sendToMaintenance || damageReported}
                    onChange={(e) => setSendToMaintenance(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 border-slate-700 bg-slate-900"
                  />
                  <label htmlFor="sendMaintenanceCheck" className="text-xs text-slate-300 cursor-pointer">
                    Flag car for workshop inspection / scheduled maintenance (status &rarr; <span className="font-semibold text-amber-400">Maintenance</span> instead of <span className="font-semibold text-emerald-400">Available</span>)
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setReturnModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReturn}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/20 disabled:opacity-50"
                >
                  {submittingReturn ? 'Completing...' : 'Complete Vehicle Return'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffPickupReturnPage;
