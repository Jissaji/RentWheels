import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Car,
  Search,
  Shield,
  Clock,
  Sparkles,
  CheckCircle2,
  Star,
  Users,
  Compass,
  CreditCard,
  ArrowRight,
  ChevronRight,
  PhoneCall
} from 'lucide-react';
import { carService } from '../services/carService';
import CarCard from '../components/CarCard';
import BookingModal from '../components/BookingModal';
import LoadingSpinner from '../components/LoadingSpinner';

const LandingPage = () => {
  const navigate = useNavigate();
  const [popularCars, setPopularCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCar, setSelectedCar] = useState(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  // Search bar controls for User Story 1
  const todayStr = new Date().toISOString().split('T')[0];
  const nextDayStr = new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0];
  const [searchLocation, setSearchLocation] = useState('Connaught Place, New Delhi');
  const [searchPickupDate, setSearchPickupDate] = useState(todayStr);
  const [searchReturnDate, setSearchReturnDate] = useState(nextDayStr);
  const [searchCategory, setSearchCategory] = useState('');
  const [dateError, setDateError] = useState('');

  useEffect(() => {
    const fetchPopular = async () => {
      try {
        const data = await carService.getFeaturedCars();
        setPopularCars(data.cars || []);
      } catch (err) {
        console.error('Error fetching featured cars:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPopular();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchPickupDate < todayStr) {
      setDateError('Pickup date cannot be in the past.');
      return;
    }
    if (searchReturnDate < searchPickupDate) {
      setDateError('Return date must be after pickup date.');
      return;
    }
    setDateError('');

    const params = new URLSearchParams();
    if (searchLocation) params.append('location', searchLocation);
    if (searchPickupDate) params.append('pickup_date', searchPickupDate);
    if (searchReturnDate) params.append('return_date', searchReturnDate);
    if (searchCategory) params.append('category', searchCategory);
    navigate(`/cars?${params.toString()}`);
  };

  const handleBookCar = (car) => {
    setSelectedCar(car);
    setIsBookingOpen(true);
  };

  return (
    <div className="relative overflow-hidden bg-slate-950 text-slate-100">
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 pb-24 lg:pt-20 lg:pb-32 overflow-hidden">
        {/* Glow background accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-gradient-to-b from-blue-600/15 via-indigo-600/5 to-transparent blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              Verified Fleet Across India • Instant Booking
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.15]">
              Rent Your Perfect Car, <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-sky-400 bg-clip-text text-transparent">
                Anytime.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Reliable, affordable and convenient car rentals for every journey. From rugged 4x4 SUVs to executive luxury sedans, unlock your drive with seamless self-service booking.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link
                to="/cars"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-xl shadow-blue-600/25 transition-all hover:scale-105"
              >
                Browse All Cars
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-semibold text-sm transition-all"
              >
                How It Works
              </a>
            </div>
          </div>

          {/* Quick Search Card (User Story 1: Location, Pickup Date, Return Date, Category) */}
          <div className="mt-14 max-w-5xl mx-auto rounded-3xl bg-slate-900/90 border border-slate-800 p-5 sm:p-7 shadow-2xl backdrop-blur-xl">
            <form onSubmit={handleSearchSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                {/* 1. Pickup Location */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Pickup Location
                  </label>
                  <select
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                    className="w-full px-3.5 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500 font-medium"
                  >
                    <option value="Connaught Place, New Delhi">Connaught Place, New Delhi</option>
                    <option value="IGI Airport Terminal 3, New Delhi">IGI Airport Terminal 3, New Delhi</option>
                    <option value="Andheri West, Mumbai">Andheri West, Mumbai</option>
                    <option value="Chhatrapati Shivaji Airport, Mumbai">Chhatrapati Shivaji Airport, Mumbai</option>
                    <option value="Indiranagar, Bengaluru">Indiranagar, Bengaluru</option>
                    <option value="Kempegowda Airport, Bengaluru">Kempegowda Airport, Bengaluru</option>
                    <option value="Banjara Hills, Hyderabad">Banjara Hills, Hyderabad</option>
                    <option value="Malviya Nagar, Jaipur">Malviya Nagar, Jaipur</option>
                  </select>
                </div>

                {/* 2. Pickup Date */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Pickup Date
                  </label>
                  <input
                    type="date"
                    min={todayStr}
                    value={searchPickupDate}
                    onChange={(e) => setSearchPickupDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* 3. Return Date */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Return Date
                  </label>
                  <input
                    type="date"
                    min={searchPickupDate || todayStr}
                    value={searchReturnDate}
                    onChange={(e) => setSearchReturnDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* 4. Car Category */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Car Category
                  </label>
                  <select
                    value={searchCategory}
                    onChange={(e) => setSearchCategory(e.target.value)}
                    className="w-full px-3.5 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500"
                  >
                    <option value="">All Categories</option>
                    <option value="Hatchback">Hatchback (Economy)</option>
                    <option value="Sedan">Sedan (Executive)</option>
                    <option value="SUV">SUV & Family</option>
                    <option value="Premium">Premium Luxury</option>
                    <option value="Electric">Electric Vehicle (EV)</option>
                  </select>
                </div>
              </div>

              {dateError && (
                <div className="text-xs text-rose-400 font-semibold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                  {dateError}
                </div>
              )}

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className="w-full sm:w-auto py-3 px-8 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 transition-all hover:scale-[1.02]"
                >
                  <Search className="w-4 h-4" />
                  Search Available Vehicles
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* 2. POPULAR CARS SECTION */}
      <section className="py-20 bg-slate-900/40 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Top Rated Fleet</span>
              <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">Popular Rental Cars</h2>
              <p className="text-sm text-slate-400 mt-1">Most frequently booked models with highest customer ratings.</p>
            </div>
            <Link
              to="/cars"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors"
            >
              Explore Full Fleet ({popularCars.length}+ Available)
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <LoadingSpinner message="Loading popular vehicles..." />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {popularCars.map((car) => (
                <CarCard key={car.car_id} car={car} onBookNow={handleBookCar} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 3. WHY CHOOSE US? SECTION */}
      <section id="about" className="py-20 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Why RentWheels</span>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">Why Choose Us?</h2>
            <p className="text-sm text-slate-400 mt-2">
              We eliminate complex paperwork, hidden fees, and uncertainty so you can enjoy every kilometer.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Guaranteed Sanitized & Safe</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Every vehicle is thoroughly sanitized, serviced by certified engineers, and inspected across a 40-point safety checklist before each handover.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <CreditCard className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Transparent Indian Tariff</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Clear pricing in Indian Rupees (₹) with standard GST calculation and automatic multi-day discounts. Zero surprise security deduction claims.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Instant Overlap Prevention</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Our relational database engine enforces strict booking interval constraints, ensuring double-booking is impossible. Your reserved dates stay yours.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS SECTION */}
      <section id="how-it-works" className="py-20 bg-slate-900/30 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Simple Process</span>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">How It Works</h2>
            <p className="text-sm text-slate-400 mt-2">
              Book your vehicle in four effortless steps in under two minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'Select Your Car',
                desc: 'Browse our diverse fleet of hatchbacks, SUVs, luxury sedans, and EVs with full specs.'
              },
              {
                step: '02',
                title: 'Choose Dates',
                desc: 'Pick your pickup and return dates with automatic past-date and overlap validation.'
              },
              {
                step: '03',
                title: 'Review Cost Breakdown',
                desc: 'Live calculation of daily fare, GST, duration discounts, and total payable in ₹.'
              },
              {
                step: '04',
                title: 'Instant Confirmation',
                desc: 'Choose your simulated payment method and receive your instant digital booking ID.'
              }
            ].map((item, idx) => (
              <div
                key={idx}
                className="relative p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3"
              >
                <div className="text-3xl font-black text-blue-500/30 font-mono">{item.step}</div>
                <h4 className="text-base font-bold text-white">{item.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. SERVICES SECTION */}
      <section id="services" className="py-20 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Tailored Solutions</span>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">Our Rental Services</h2>
            <p className="text-sm text-slate-400 mt-2">
              Flexible mobility options designed for leisure road trips, corporate travel, and weekend getaways.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-slate-900/50 border border-slate-800 space-y-3">
              <Compass className="w-8 h-8 text-blue-400" />
              <h3 className="text-base font-bold text-white">Self-Drive Outstation Trips</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Unlimited freedom for long highway road trips with well-maintained diesel and hybrid SUVs equipped with all-India permits.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900/50 border border-slate-800 space-y-3">
              <Users className="w-8 h-8 text-indigo-400" />
              <h3 className="text-base font-bold text-white">Corporate & Wedding Fleet</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Premium vehicles including Toyota Innova Hycross and BMW 3 Series for executive guest transit and wedding ceremonies.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900/50 border border-slate-800 space-y-3">
              <Sparkles className="w-8 h-8 text-emerald-400" />
              <h3 className="text-base font-bold text-white">City Electric Commutes</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Eco-conscious driving with Tata Nexon EV offering long range, whisper-silent cabins, and zero carbon emissions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CUSTOMER REVIEWS SECTION */}
      <section className="py-20 bg-slate-900/40 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Testimonials</span>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">What Our Drivers Say</h2>
            <p className="text-sm text-slate-400 mt-2">
              Over 10,000+ satisfied customers across New Delhi, Mumbai, and Bengaluru.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: 'Rajesh Sharma',
                city: 'Noida, NCR',
                car: 'Toyota Innova Hycross',
                review: 'Rented the Innova for our family trip to Agra. The booking system was seamless, the car was pristine, and the fuel efficiency was stellar.'
              },
              {
                name: 'Priya Patel',
                city: 'Mumbai',
                car: 'Hyundai Creta SX',
                review: 'Best car rental platform I have used in India. Loved the transparent GST breakdown and instant confirmation with no hidden cancellation traps.'
              },
              {
                name: 'Amit Verma',
                city: 'Bengaluru',
                car: 'Mahindra Thar 4x4',
                review: 'The Thar was in showroom condition. Took it on a weekend off-road trek to Coorg. Super smooth booking and check-in process!'
              }
            ].map((rev, idx) => (
              <div key={idx} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="flex text-amber-400 gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-slate-300 italic leading-relaxed">"{rev.review}"</p>
                <div className="pt-3 border-t border-slate-800/80">
                  <div className="text-xs font-bold text-white">{rev.name}</div>
                  <div className="text-[11px] text-slate-400">{rev.city} • Rented {rev.car}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. CALL TO ACTION SECTION */}
      <section id="contact" className="py-20 border-t border-slate-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="p-10 sm:p-14 rounded-3xl bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-slate-900 border border-blue-500/30 shadow-2xl space-y-6">
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Ready to Hit the Open Road?
            </h2>
            <p className="text-sm text-slate-300 max-w-xl mx-auto">
              Join thousands of happy travelers. Choose your destination, pick your dream ride, and drive away in minutes.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link
                to="/cars"
                className="px-8 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-xl shadow-blue-600/30 transition-all hover:scale-105"
              >
                Book Your Car Now
              </Link>
              <Link
                to="/register"
                className="px-8 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-semibold text-sm transition-all"
              >
                Create Free Account
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Booking Modal */}
      <BookingModal
        car={selectedCar}
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        onSuccess={() => {}}
      />
    </div>
  );
};

export default LandingPage;
