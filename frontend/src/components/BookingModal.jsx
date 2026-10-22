import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Calendar,
  CheckCircle2,
  CreditCard,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Car,
  AlertCircle,
  MapPin,
  User,
  Phone,
  Mail,
  FileText,
  Bell
} from 'lucide-react';
import { bookingService } from '../services/bookingService';
import { carService } from '../services/carService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { formatINR } from '../utils/formatters';

const getMinPickupDate = () => {
  return new Date().toISOString().split('T')[0];
};

const getDefaultReturnDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + 2);
  return d.toISOString().split('T')[0];
};

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

const BookingModal = ({
  car,
  isOpen,
  initialPickupLocation = '',
  initialPickupDate = '',
  initialReturnDate = '',
  onClose,
  onSuccess
}) => {
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState(2); // Step 2 (Dates & Location), Step 3 (Summary & Payment), Step 5 (Confirmation)
  const [pickupLocation, setPickupLocation] = useState(initialPickupLocation || 'Connaught Place, New Delhi');
  const [returnLocation, setReturnLocation] = useState(initialPickupLocation || 'Connaught Place, New Delhi');
  const [pickupDate, setPickupDate] = useState(initialPickupDate || getMinPickupDate());
  const [returnDate, setReturnDate] = useState(initialReturnDate || getDefaultReturnDate());
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [specialRequests, setSpecialRequests] = useState('');
  const [drivingLicense, setDrivingLicense] = useState(user?.driving_license || '');
  const [contactPhone, setContactPhone] = useState(user?.phone || '');

  const [calculating, setCalculating] = useState(false);
  const [calculation, setCalculation] = useState(null);
  const [calcError, setCalcError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  // Sync props when modal opens
  useEffect(() => {
    if (isOpen) {
      if (initialPickupLocation) {
        setPickupLocation(initialPickupLocation);
        setReturnLocation(initialPickupLocation);
      }
      if (initialPickupDate) setPickupDate(initialPickupDate);
      if (initialReturnDate) setReturnDate(initialReturnDate);
      if (user) {
        setDrivingLicense(user.driving_license || '');
        setContactPhone(user.phone || '');
      }
    }
  }, [isOpen, initialPickupLocation, initialPickupDate, initialReturnDate, user]);

  // Recalculate price whenever dates change
  useEffect(() => {
    if (!car || !pickupDate || !returnDate || !isOpen) return;

    if (pickupDate < getMinPickupDate()) {
      setCalcError('Pickup date cannot be in the past.');
      setCalculation(null);
      return;
    }

    if (returnDate < pickupDate) {
      setCalcError('Return date cannot be earlier than pickup date.');
      setCalculation(null);
      return;
    }

    const fetchCalculation = async () => {
      setCalculating(true);
      setCalcError('');
      try {
        // Live availability check immediately on backend
        const availRes = await carService.checkAvailability(car.car_id, pickupDate, returnDate);
        if (!availRes.available) {
          setCalcError(availRes.reason || 'This vehicle is already reserved for the selected dates.');
          setCalculation(null);
          setCalculating(false);
          return;
        }

        const data = await bookingService.calculatePrice({
          car_id: car.car_id,
          pickup_date: pickupDate,
          return_date: returnDate
        });
        setCalculation(data.calculation);
      } catch (err) {
        setCalcError(err.response?.data?.message || 'Error checking availability');
        setCalculation(null);
      } finally {
        setCalculating(false);
      }
    };

    const timeout = setTimeout(fetchCalculation, 300);
    return () => clearTimeout(timeout);
  }, [car, pickupDate, returnDate, isOpen]);

  if (!isOpen || !car) return null;

  const handleNextToConfirm = () => {
    if (!isAuthenticated) {
      showToast('Please log in or register to complete your reservation.', 'info');
      onClose();
      navigate('/login');
      return;
    }
    if (!calculation || calcError) {
      showToast('Please resolve date or availability errors before proceeding.', 'error');
      return;
    }
    setStep(3); // Review and Simulated Payment
  };

  const handleFinalBooking = async () => {
    setSubmitting(true);
    try {
      const res = await bookingService.createBooking({
        car_id: car.car_id,
        pickup_location: pickupLocation,
        return_location: returnLocation,
        pickup_date: pickupDate,
        return_date: returnDate,
        payment_method: paymentMethod,
        special_requests: specialRequests
      });

      setConfirmedBooking(res.booking);
      setStep(5); // Success state
      showToast('Booking successfully placed & confirmed!', 'success');
      if (onSuccess) onSuccess(res.booking);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to complete booking.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleModalClose = () => {
    setStep(2);
    setConfirmedBooking(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8 animate-fade-in">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {step === 5 ? 'Booking Confirmed!' : `Reserve ${car.brand} ${car.model}`}
              </h3>
              <p className="text-xs text-slate-400">
                {step === 2 && 'Step 1 of 2: Dates, Hub Location & Availability Check'}
                {step === 3 && 'Step 2 of 2: Passenger Details & Simulated Payment'}
                {step === 5 && 'Digital Confirmation & Invoice Reference'}
              </p>
            </div>
          </div>
          <button
            onClick={handleModalClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {step === 2 && (
            <div className="space-y-6">
              {/* Selected Car preview card */}
              <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-slate-800/40 border border-slate-800">
                <img
                  src={car.image}
                  alt={car.model}
                  className="w-24 h-16 rounded-xl object-cover shrink-0 bg-slate-950"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-blue-400 font-semibold uppercase">{car.brand}</span>
                    {car.category && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-950 text-slate-300 border border-slate-700">
                        {car.category}
                      </span>
                    )}
                  </div>
                  <h4 className="text-base font-bold text-white truncate">{car.model}</h4>
                  <div className="text-xs text-slate-400">
                    {car.fuel_type} • {car.transmission} • {car.seats} Seats • Reg: {car.registration_number}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400">Tariff</div>
                  <div className="text-base font-black text-white">{formatINR(car.price_per_day)}<span className="text-[11px] font-normal text-slate-400">/day</span></div>
                </div>
              </div>

              {/* Hub Location selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-blue-400" />
                    Pickup Location
                  </label>
                  <select
                    value={pickupLocation}
                    onChange={(e) => setPickupLocation(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500 font-medium"
                  >
                    {LOCATIONS.map(loc => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-blue-400" />
                    Return Drop-off Location
                  </label>
                  <select
                    value={returnLocation}
                    onChange={(e) => setReturnLocation(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500 font-medium"
                  >
                    {LOCATIONS.map(loc => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Date pickers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-blue-400" />
                    Pickup Date
                  </label>
                  <input
                    type="date"
                    min={getMinPickupDate()}
                    value={pickupDate}
                    onChange={(e) => setPickupDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-blue-400" />
                    Return Date
                  </label>
                  <input
                    type="date"
                    min={pickupDate || getMinPickupDate()}
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Error indicator */}
              {calcError && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{calcError}</span>
                </div>
              )}

              {/* Dynamic Price Preview Box */}
              {calculation && !calcError && (
                <div className="rounded-2xl bg-slate-950/60 border border-slate-800 p-4 space-y-2.5">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Rental Duration</span>
                    <span className="font-semibold text-slate-200">{calculation.rental_days} Day{calculation.rental_days > 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Rental Subtotal ({calculation.rental_days} × {formatINR(calculation.price_per_day)})</span>
                    <span className="font-semibold text-slate-200">{formatINR(calculation.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Standard GST (18%)</span>
                    <span className="font-semibold text-slate-200">{formatINR(calculation.tax)}</span>
                  </div>
                  {calculation.discount > 0 && (
                    <div className="flex justify-between text-xs text-emerald-400">
                      <span>Multi-day Promotional Discount</span>
                      <span className="font-semibold">-{formatINR(calculation.discount)}</span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-slate-800 flex justify-between items-baseline">
                    <span className="text-sm font-bold text-white">Total Amount</span>
                    <span className="text-xl font-black text-blue-400">{formatINR(calculation.total_amount)}</span>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!calculation || Boolean(calcError) || calculating}
                  onClick={handleNextToConfirm}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-lg shadow-blue-600/20 transition-all"
                >
                  {calculating ? 'Validating...' : 'Review Details & Pay'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 3 && calculation && (
            <div className="space-y-6">
              {/* Customer Personal Details Confirmation */}
              <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider">
                  <User className="w-3.5 h-3.5" />
                  Passenger / Primary Driver Details
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block mb-0.5">Customer Name</span>
                    <span className="font-bold text-white">{user?.name || 'Customer'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">Email</span>
                    <span className="font-bold text-white">{user?.email}</span>
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Driving License No.</label>
                    <input
                      type="text"
                      value={drivingLicense}
                      onChange={(e) => setDrivingLicense(e.target.value)}
                      placeholder="DL-0420180012345"
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs uppercase"
                    />
                  </div>
                </div>
              </div>

              {/* Booking Itinerary Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Pickup Hub</span>
                  <span className="font-semibold text-white truncate block">{pickupLocation}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Rental Dates</span>
                  <span className="font-semibold text-white block">{pickupDate} → {returnDate}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Duration</span>
                  <span className="font-semibold text-white block">{calculation.rental_days} Days</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Vehicle</span>
                  <span className="font-semibold text-white truncate block">{car.brand} {car.model}</span>
                </div>
              </div>

              {/* Special Requests */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Special Requests / Travel Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder="e.g. Airport delivery, child safety seat, early check-in..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Simulated Payment Method Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Payment Method (Simulated Payment - Demonstration)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { id: 'UPI', label: 'UPI / QR Scan' },
                    { id: 'Card', label: 'Debit / Credit Card' },
                    { id: 'Net Banking', label: 'Net Banking' },
                    { id: 'Cash', label: 'Pay at Pickup' }
                  ].map((method) => (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setPaymentMethod(method.id)}
                      className={`p-3 rounded-xl border text-xs font-semibold text-left transition-all ${
                        paymentMethod === method.id
                          ? 'border-blue-500 bg-blue-600/15 text-white shadow-md shadow-blue-500/10'
                          : 'border-slate-800 bg-slate-800/40 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <CreditCard className="w-4 h-4 text-blue-400" />
                        {paymentMethod === method.id && (
                          <div className="w-2 h-2 rounded-full bg-blue-500" />
                        )}
                      </div>
                      <div>{method.label}</div>
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-[11px] text-slate-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  Simulated sandbox transaction. No real credit card or bank credentials are required or stored.
                </p>
              </div>

              {/* Total display */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/40 to-slate-900 border border-blue-500/20 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400">Final Payable Amount</span>
                  <div className="text-2xl font-black text-white">{formatINR(calculation.total_amount)}</div>
                </div>
                <div className="text-right text-xs text-slate-400">
                  {calculation.rental_days} Days @ {formatINR(calculation.price_per_day)}/day + 18% GST
                </div>
              </div>

              {/* Footer Buttons */}
              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Modify Dates
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleFinalBooking}
                  className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 rounded-xl shadow-lg shadow-emerald-600/20 transition-all hover:scale-[1.02]"
                >
                  {submitting ? 'Confirming Reservation...' : 'Confirm & Reserve Vehicle'}
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 5 && confirmedBooking && (
            <div className="text-center py-6 space-y-5 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/10">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-2xl font-black text-white">Booking Confirmed!</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Your official reservation reference is <span className="font-mono text-blue-400 font-bold">#{confirmedBooking.booking_id}</span>
                </p>
              </div>

              <div className="max-w-md mx-auto p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-left text-xs space-y-2.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Vehicle</span>
                  <span className="font-bold text-white">{confirmedBooking.brand} {confirmedBooking.model}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Pickup Location</span>
                  <span className="font-semibold text-slate-200">{confirmedBooking.pickup_location || pickupLocation}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Rental Period</span>
                  <span className="font-bold text-white">{confirmedBooking.pickup_date} to {confirmedBooking.return_date} ({confirmedBooking.rental_days} days)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Payment Status</span>
                  <span className="font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    {confirmedBooking.payment_status || 'Paid'} ({paymentMethod})
                  </span>
                </div>
                <div className="flex justify-between border-t border-slate-800 pt-2 font-bold text-white">
                  <span>Total Amount</span>
                  <span className="text-blue-400 text-sm">{formatINR(confirmedBooking.total_amount)}</span>
                </div>
              </div>

              {/* In-App Notification and Email Notice */}
              <div className="max-w-md mx-auto p-3.5 rounded-2xl bg-blue-950/30 border border-blue-500/20 text-xs text-slate-300 text-left space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-blue-400">
                  <Bell className="w-4 h-4 text-blue-400" />
                  Confirmation Delivered In-App
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  A booking confirmation notification has been recorded in your account.
                  <br />
                  <span className="text-slate-400 italic">Note: Real SMTP email delivery requires email server credentials.</span>
                </p>
              </div>

              <div className="flex justify-center gap-3 pt-3">
                <button
                  onClick={() => {
                    handleModalClose();
                    navigate('/customer/bookings');
                  }}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-lg shadow-blue-600/20 transition-all"
                >
                  View in My Bookings
                </button>
                <button
                  onClick={handleModalClose}
                  className="px-5 py-2.5 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
