import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  RotateCcw,
  Car as CarIcon,
  SlidersHorizontal,
  MapPin,
  Calendar,
  AlertCircle,
  Tag,
  CheckCircle2
} from 'lucide-react';
import { carService } from '../services/carService';
import CarCard from '../components/CarCard';
import BookingModal from '../components/BookingModal';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

const todayStr = new Date().toISOString().split('T')[0];

const POPULAR_LOCATIONS = [
  'Connaught Place, New Delhi',
  'IGI Airport Terminal 3, New Delhi',
  'Andheri West, Mumbai',
  'Chhatrapati Shivaji Airport, Mumbai',
  'Indiranagar, Bengaluru',
  'Kempegowda Airport, Bengaluru',
  'Banjara Hills, Hyderabad',
  'Malviya Nagar, Jaipur'
];

const BRANDS = [
  'Maruti Suzuki',
  'Hyundai',
  'Tata',
  'Mahindra',
  'Honda',
  'Kia',
  'MG',
  'Toyota',
  'Volkswagen',
  'BMW',
  'Mercedes-Benz',
  'Audi'
];

const CATEGORIES = [
  { label: 'All Categories', value: '' },
  { label: 'Hatchback (Economy)', value: 'Hatchback' },
  { label: 'Sedan (Executive)', value: 'Sedan' },
  { label: 'SUV & Family (4x4 / 7-Seater)', value: 'SUV' },
  { label: 'Premium Luxury (BMW / Merc / Audi)', value: 'Premium' },
  { label: 'Electric Vehicle (EV)', value: 'Electric' }
];

const CarListingPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search fields (User Story 1)
  const [pickupLocation, setPickupLocation] = useState(searchParams.get('location') || '');
  const [pickupDate, setPickupDate] = useState(searchParams.get('pickup_date') || '');
  const [returnDate, setReturnDate] = useState(searchParams.get('return_date') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');

  // Filter fields (User Story 1)
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [brand, setBrand] = useState(searchParams.get('brand') || '');
  const [fuelType, setFuelType] = useState(searchParams.get('fuel_type') || '');
  const [transmission, setTransmission] = useState(searchParams.get('transmission') || '');
  const [seats, setSeats] = useState(searchParams.get('seats') || '');
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('min_price') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('max_price') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort_by') || 'newest');

  // Error validation
  const [dateError, setDateError] = useState('');

  // Booking modal
  const [selectedCar, setSelectedCar] = useState(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  // Synchronize internal state from URL params
  useEffect(() => {
    setPickupLocation(searchParams.get('location') || '');
    setPickupDate(searchParams.get('pickup_date') || '');
    setReturnDate(searchParams.get('return_date') || '');
    setCategory(searchParams.get('category') || '');
    setSearch(searchParams.get('search') || '');
    setBrand(searchParams.get('brand') || '');
    setFuelType(searchParams.get('fuel_type') || '');
    setTransmission(searchParams.get('transmission') || '');
    setSeats(searchParams.get('seats') || '');
    setStatus(searchParams.get('status') || '');
    setMinPrice(searchParams.get('min_price') || '');
    setMaxPrice(searchParams.get('max_price') || '');
    setSortBy(searchParams.get('sort_by') || 'newest');
  }, [searchParams]);

  const fetchCars = async () => {
    // Validate dates if specified
    if (pickupDate && pickupDate < todayStr) {
      setDateError('Pickup date cannot be in the past.');
      return;
    }
    if (pickupDate && returnDate && returnDate < pickupDate) {
      setDateError('Return date must be on or after pickup date.');
      return;
    }
    setDateError('');

    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (brand) params.brand = brand;
      if (category) params.category = category;
      if (fuelType) params.fuel_type = fuelType;
      if (transmission) params.transmission = transmission;
      if (seats) params.seats = seats;
      if (status) params.status = status;
      if (minPrice) params.min_price = minPrice;
      if (maxPrice) params.max_price = maxPrice;
      if (pickupDate && returnDate) {
        params.pickup_date = pickupDate;
        params.return_date = returnDate;
      }
      if (sortBy) params.sort_by = sortBy;

      const data = await carService.getAllCars(params);
      setCars(data.cars || []);
    } catch (err) {
      console.error('Failed to load cars:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCars();
  }, [search, brand, category, fuelType, transmission, seats, status, minPrice, maxPrice, sortBy, pickupDate, returnDate]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCars();
  };

  const handleResetFilters = () => {
    setSearch('');
    setBrand('');
    setCategory('');
    setPickupLocation('');
    setPickupDate('');
    setReturnDate('');
    setFuelType('');
    setTransmission('');
    setSeats('');
    setStatus('');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('newest');
    setDateError('');
    setSearchParams({});
  };

  const handleBookCar = (car) => {
    setSelectedCar(car);
    setIsBookingOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <CarIcon className="w-3.5 h-3.5" />
            Verified Fleet Catalog
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Available Rental Cars</h1>
          <p className="text-sm text-slate-400 mt-1">
            Browse, filter, and reserve from our premium self-drive vehicles across India.
          </p>
        </div>

        {/* Primary Search Controls (User Story 1: Location, Dates, Category) */}
        <div className="mb-6 p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
          <form onSubmit={handleSearchSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* 1. Pickup Location */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-400" />
                  Pickup Location
                </label>
                <select
                  value={pickupLocation}
                  onChange={(e) => setPickupLocation(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500"
                >
                  <option value="">All Rental Hubs</option>
                  {POPULAR_LOCATIONS.map((loc) => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>

              {/* 2. Pickup Date */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-blue-400" />
                  Pickup Date
                </label>
                <input
                  type="date"
                  min={todayStr}
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* 3. Return Date */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-blue-400" />
                  Return Date
                </label>
                <input
                  type="date"
                  min={pickupDate || todayStr}
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* 4. Car Category */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-blue-400" />
                  Car Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {dateError && (
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-semibold">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                {dateError}
              </div>
            )}

            {pickupDate && returnDate && !dateError && (
              <div className="flex items-center gap-2 p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                Filtering vehicles with 100% verified availability between {pickupDate} and {returnDate}.
              </div>
            )}
          </form>
        </div>

        {/* Search Bar & Mobile Filter Toggle & Sort */}
        <div className="mb-6 flex flex-col sm:flex-row gap-3">
          <form onSubmit={handleSearchSubmit} className="flex-1 relative">
            <input
              type="text"
              placeholder="Search by vehicle model, brand, or registration plate..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </form>

          <button
            onClick={() => setShowFiltersMobile(!showFiltersMobile)}
            className="sm:hidden flex items-center justify-center gap-2 px-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-xs font-bold text-slate-200"
          >
            <SlidersHorizontal className="w-4 h-4 text-blue-400" />
            {showFiltersMobile ? 'Hide Filters' : 'Show Filters'}
          </button>

          {/* Sort Selector */}
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-white text-xs font-medium focus:outline-none focus:border-blue-500"
            >
              <option value="newest">Sort: Newest Fleet</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="year_desc">Model Year: Newest</option>
            </select>
          </div>
        </div>

        {/* Main Layout: Filters Sidebar + Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <aside className={`lg:block ${showFiltersMobile ? 'block' : 'hidden'} space-y-6`}>
            <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
                  <Filter className="w-4 h-4 text-blue-400" />
                  Vehicle Filters
                </div>
                <button
                  onClick={handleResetFilters}
                  className="text-[11px] text-slate-400 hover:text-blue-400 flex items-center gap-1 transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset All
                </button>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Car Type / Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              {/* Brand Filter */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Brand / Manufacturer
                </label>
                <select
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="">All Brands</option>
                  {BRANDS.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              {/* Fuel Type */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Fuel Type
                </label>
                <select
                  value={fuelType}
                  onChange={(e) => setFuelType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="">All Fuel Types</option>
                  <option value="Petrol">Petrol</option>
                  <option value="Diesel">Diesel</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="Electric">Electric (EV)</option>
                </select>
              </div>

              {/* Transmission */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Transmission
                </label>
                <select
                  value={transmission}
                  onChange={(e) => setTransmission(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="">All Transmissions</option>
                  <option value="Manual">Manual</option>
                  <option value="Automatic">Automatic</option>
                </select>
              </div>

              {/* Seating Capacity */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Min. Seating
                </label>
                <select
                  value={seats}
                  onChange={(e) => setSeats(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="">Any Seating</option>
                  <option value="4">4+ Seats</option>
                  <option value="5">5+ Seats</option>
                  <option value="7">7+ Seats (Family MPV)</option>
                </select>
              </div>

              {/* Availability Filter (only if dates not set) */}
              {!pickupDate && (
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Fleet Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="">All Statuses</option>
                    <option value="Available">Available Now</option>
                    <option value="Rented">Currently Rented</option>
                    <option value="Maintenance">Under Maintenance</option>
                  </select>
                </div>
              )}

              {/* Daily Price Range */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Price Range (₹/day)
                  </label>
                  <span className="text-xs font-mono text-blue-400 font-bold">
                    {minPrice ? `₹${minPrice}` : '₹1,000'} - {maxPrice ? `₹${maxPrice}` : '₹10,000+'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <input
                    type="number"
                    placeholder="Min ₹"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                  <input
                    type="number"
                    placeholder="Max ₹"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </aside>

          {/* Cars Grid */}
          <div className="lg:col-span-3">
            {loading ? (
              <LoadingSpinner message="Searching verified vehicle inventory..." />
            ) : cars.length === 0 ? (
              <EmptyState
                icon={CarIcon}
                title="No cars match your criteria"
                description={
                  pickupDate && returnDate
                    ? "All vehicles in this category are booked for the requested dates or undergo maintenance. Try altering your dates or selecting another category."
                    : "Try broadening your filters, choosing a different brand or adjusting your price range."
                }
                actionLabel="Clear All Filters"
                onAction={handleResetFilters}
              />
            ) : (
              <div>
                <div className="mb-4 text-xs font-semibold text-slate-400 flex items-center justify-between">
                  <span>Showing <span className="text-white font-bold">{cars.length}</span> matching vehicle{cars.length !== 1 ? 's' : ''}</span>
                  {category && <span className="text-blue-400">Category: {category}</span>}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {cars.map((car) => (
                    <CarCard key={car.car_id} car={car} onBookNow={handleBookCar} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <BookingModal
        car={selectedCar}
        isOpen={isBookingOpen}
        initialPickupLocation={pickupLocation}
        initialPickupDate={pickupDate}
        initialReturnDate={returnDate}
        onClose={() => setIsBookingOpen(false)}
        onSuccess={() => fetchCars()}
      />
    </div>
  );
};

export default CarListingPage;
