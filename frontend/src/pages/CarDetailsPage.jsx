import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Car,
  Fuel,
  Gauge,
  Users,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  CreditCard,
  Hash,
  MapPin,
  Sparkles
} from 'lucide-react';
import { carService } from '../services/carService';
import { bookingService } from '../services/bookingService';
import StatusBadge from '../components/StatusBadge';
import BookingModal from '../components/BookingModal';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatINR } from '../utils/formatters';

const getMinPickupDate = () => new Date().toISOString().split('T')[0];
const getDefaultReturnDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + 3);
  return d.toISOString().split('T')[0];
};

const CarDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Interactive booking calculator panel
  const [pickupDate, setPickupDate] = useState(getMinPickupDate());
  const [returnDate, setReturnDate] = useState(getDefaultReturnDate());
  const [calculation, setCalculation] = useState(null);
  const [calculating, setCalculating] = useState(false);
  const [calcError, setCalcError] = useState('');

  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  useEffect(() => {
    const fetchCar = async () => {
      setLoading(true);
      try {
        const data = await carService.getCarById(id);
        setCar(data.car);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load car details.');
      } finally {
        setLoading(false);
      }
    };
    fetchCar();
  }, [id]);

  // Recalculate price whenever dates or car change
  useEffect(() => {
    if (!car || !pickupDate || !returnDate) return;

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

    const runCalc = async () => {
      setCalculating(true);
      setCalcError('');
      try {
        // Overlap verification
        const avail = await carService.checkAvailability(car.car_id, pickupDate, returnDate);
        if (!avail.available) {
          setCalcError(avail.reason || 'Vehicle already reserved for these dates.');
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
        setCalcError(err.response?.data?.message || 'Calculation error');
        setCalculation(null);
      } finally {
        setCalculating(false);
      }
    };

    const t = setTimeout(runCalc, 200);
    return () => clearTimeout(t);
  }, [car, pickupDate, returnDate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 py-20">
        <LoadingSpinner message="Loading vehicle specifications..." />
      </div>
    );
  }

  if (error || !car) {
    return (
      <div className="min-h-screen bg-slate-950 py-20 text-center">
        <div className="max-w-md mx-auto p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
          <h2 className="text-xl font-bold text-white">Car Not Found</h2>
          <p className="text-xs text-slate-400">{error || 'This vehicle is not found or has been removed.'}</p>
          <button
            onClick={() => navigate('/cars')}
            className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 rounded-xl"
          >
            Back to Car Catalog
          </button>
        </div>
      </div>
    );
  }

  const isAvailable = car.status === 'Available';

  return (
    <div className="min-h-screen bg-slate-950 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb */}
        <div className="mb-6">
          <Link
            to="/cars"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Cars Catalog
          </Link>
        </div>

        {/* Hero Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left 2 Cols: Large Car Media & Specs */}
          <div className="lg:col-span-2 space-y-6">
            {/* Large Image Showcase */}
            <div className="relative aspect-[16/10] rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl">
              <img
                src={car.image}
                alt={`${car.brand} ${car.model}`}
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute top-4 right-4">
                <StatusBadge status={car.status} />
              </div>
              {Boolean(car.is_featured) && (
                <div className="absolute top-4 left-4 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-lg shadow-md">
                  Featured Model
                </div>
              )}
            </div>

            {/* Vehicle Title & Description */}
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                      {car.brand}
                    </span>
                    {car.category && (
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-slate-950 text-blue-300 border border-slate-700 font-bold uppercase">
                        {car.category}
                      </span>
                    )}
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
                    {car.model}
                  </h1>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Daily Tariff</span>
                  <div className="text-2xl font-black text-white">
                    {formatINR(car.price_per_day)}
                    <span className="text-xs font-normal text-slate-400"> / day</span>
                  </div>
                </div>
              </div>

              <p className="text-sm text-slate-300 leading-relaxed">
                {car.description || 'Premium automotive rental vehicle with modern safety systems, verified maintenance records, and unlimited mileage allowances.'}
              </p>

              {/* Key Specifications Grid */}
              <div className="pt-4 border-t border-slate-800">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
                  Vehicle Specifications
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                    <Fuel className="w-4 h-4 text-blue-400 mb-1" />
                    <span className="text-[11px] text-slate-400 block">Fuel Type</span>
                    <span className="text-xs font-bold text-white">{car.fuel_type}</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                    <Gauge className="w-4 h-4 text-blue-400 mb-1" />
                    <span className="text-[11px] text-slate-400 block">Transmission</span>
                    <span className="text-xs font-bold text-white">{car.transmission}</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                    <Users className="w-4 h-4 text-blue-400 mb-1" />
                    <span className="text-[11px] text-slate-400 block">Capacity</span>
                    <span className="text-xs font-bold text-white">{car.seats} Seats</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                    <Calendar className="w-4 h-4 text-blue-400 mb-1" />
                    <span className="text-[11px] text-slate-400 block">Model Year</span>
                    <span className="text-xs font-bold text-white">{car.year}</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                    <Sparkles className="w-4 h-4 text-blue-400 mb-1" />
                    <span className="text-[11px] text-slate-400 block">Efficiency / Range</span>
                    <span className="text-xs font-bold text-white">{car.mileage || '16 km/l'}</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                    <Hash className="w-4 h-4 text-blue-400 mb-1" />
                    <span className="text-[11px] text-slate-400 block">Reg. Number</span>
                    <span className="text-xs font-mono font-bold text-white">{car.registration_number}</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 sm:col-span-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 mb-1" />
                    <span className="text-[11px] text-slate-400 block">Insurance & Verification</span>
                    <span className="text-xs font-bold text-emerald-400">Comprehensive Zero-Dep Insured</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Col: Live Booking Panel (Section 6 requirement) */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-5">
              <div className="pb-3 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">Book This Car</h3>
                  <p className="text-[11px] text-slate-400">Select dates to calculate dynamic fare</p>
                </div>
                <StatusBadge status={car.status} />
              </div>

              {!isAvailable ? (
                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs space-y-2">
                  <div className="font-bold flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4" />
                    Car Currently Unavailable
                  </div>
                  <p className="leading-relaxed">
                    This vehicle is marked as <span className="font-semibold">{car.status}</span>. You may choose another vehicle from our catalog.
                  </p>
                  <Link
                    to="/cars"
                    className="inline-block mt-2 font-bold text-blue-400 hover:underline"
                  >
                    Browse Other Available Cars →
                  </Link>
                </div>
              ) : (
                <>
                  {/* Date Selectors */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                        Pickup Date
                      </label>
                      <input
                        type="date"
                        min={getMinPickupDate()}
                        value={pickupDate}
                        onChange={(e) => setPickupDate(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                        Return Date
                      </label>
                      <input
                        type="date"
                        min={pickupDate}
                        value={returnDate}
                        onChange={(e) => setReturnDate(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Validation Error Feedback */}
                  {calcError && (
                    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{calcError}</span>
                    </div>
                  )}

                  {/* Live Calculation Panel */}
                  {calculation && !calcError && (
                    <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2.5 text-xs">
                      <div className="flex justify-between text-slate-400">
                        <span>Duration</span>
                        <span className="font-bold text-white">{calculation.rental_days} Days</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Base Rental Cost</span>
                        <span className="font-semibold text-slate-200">
                          {calculation.rental_days} × {formatINR(calculation.price_per_day)} = {formatINR(calculation.subtotal)}
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>GST Tax (18%)</span>
                        <span className="font-semibold text-slate-200">{formatINR(calculation.tax)}</span>
                      </div>
                      {calculation.discount > 0 && (
                        <div className="flex justify-between text-emerald-400">
                          <span>Multi-Day Discount</span>
                          <span className="font-semibold">-{formatINR(calculation.discount)}</span>
                        </div>
                      )}
                      <div className="pt-2 border-t border-slate-800 flex justify-between items-baseline font-bold">
                        <span className="text-white text-sm">Total Rental Cost</span>
                        <span className="text-xl font-black text-blue-400">
                          {formatINR(calculation.total_amount)}
                        </span>
                      </div>
                    </div>
                  )}

                  <button
                    disabled={!calculation || Boolean(calcError) || calculating}
                    onClick={() => setIsBookingModalOpen(true)}
                    className="w-full py-3.5 px-6 rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm shadow-xl shadow-blue-600/25 transition-all"
                  >
                    {calculating ? 'Checking Dates...' : 'Book Now'}
                  </button>
                </>
              )}

              {/* Guarantees */}
              <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 space-y-1.5">
                <div className="flex items-center gap-1.5 text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Free cancellation up to pickup time
                </div>
                <div className="flex items-center gap-1.5 text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Simulated instant online confirmation
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <BookingModal
        car={car}
        isOpen={isBookingModalOpen}
        initialPickupDate={pickupDate}
        initialReturnDate={returnDate}
        onClose={() => setIsBookingModalOpen(false)}
        onSuccess={() => {}}
      />
    </div>
  );
};

export default CarDetailsPage;
