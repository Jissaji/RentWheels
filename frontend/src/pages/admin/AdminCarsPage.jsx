import React, { useState, useEffect } from 'react';
import {
  Car,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  AlertCircle,
  CheckCircle2,
  X,
  Upload,
  Eye,
  Fuel,
  Users,
  Gauge,
  History,
  Calendar,
  IndianRupee,
  Tag
} from 'lucide-react';
import { carService } from '../../services/carService';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import ConfirmationDialog from '../../components/ConfirmationDialog';
import { useToast } from '../../context/ToastContext';
import { formatINR, formatDate } from '../../utils/formatters';

const initialCarState = {
  brand: '',
  model: '',
  registration_number: '',
  year: new Date().getFullYear(),
  category: 'Sedan',
  fuel_type: 'Petrol',
  transmission: 'Automatic',
  seats: 5,
  mileage: '16 km/l',
  price_per_day: '',
  image: '',
  description: '',
  status: 'Available',
  is_featured: false
};

const CATEGORIES = [
  'Hatchback',
  'Sedan',
  'SUV',
  'Premium',
  'Electric'
];

const AdminCarsPage = () => {
  const { showToast } = useToast();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [fuelFilter, setFuelFilter] = useState('ALL');

  // Add / Edit Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [formData, setFormData] = useState(initialCarState);
  const [editingId, setEditingId] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // Booking History Modal State (User Story 3)
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [historyCar, setHistoryCar] = useState(null);
  const [carBookings, setCarBookings] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Delete / Deactivate dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [carToDelete, setCarToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchCars = async () => {
    setLoading(true);
    try {
      const data = await carService.getAllCars();
      setCars(data.cars || []);
    } catch (err) {
      console.error('Failed to fetch cars:', err);
      showToast('Could not load vehicles from database.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCars();
  }, []);

  const handleOpenAdd = () => {
    setModalMode('add');
    setEditingId(null);
    setFormData(initialCarState);
    setFormError('');
    setModalOpen(true);
  };

  const handleOpenEdit = (car) => {
    setModalMode('edit');
    setEditingId(car.car_id);
    setFormData({
      brand: car.brand,
      model: car.model,
      registration_number: car.registration_number,
      year: car.year,
      category: car.category || 'Sedan',
      fuel_type: car.fuel_type,
      transmission: car.transmission,
      seats: car.seats,
      mileage: car.mileage || '16 km/l',
      price_per_day: car.price_per_day,
      image: car.image,
      description: car.description || '',
      status: car.status,
      is_featured: !!car.is_featured
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleOpenHistory = async (car) => {
    setHistoryCar(car);
    setHistoryModalOpen(true);
    setHistoryLoading(true);
    try {
      const data = await carService.getCarBookings(car.car_id);
      setCarBookings(data.bookings || []);
    } catch (err) {
      showToast('Could not fetch car booking history.', 'error');
      setCarBookings([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!formData.brand || !formData.model || !formData.registration_number || !formData.price_per_day || !formData.image) {
      setFormError('Please fill in all required fields (Brand, Model, Plate, Price, Image).');
      return;
    }

    if (Number(formData.price_per_day) <= 0) {
      setFormError('Price per day must be greater than zero.');
      return;
    }

    setFormLoading(true);
    setFormError('');

    try {
      if (modalMode === 'add') {
        await carService.createCar(formData);
        showToast(`Vehicle ${formData.brand} ${formData.model} added successfully!`, 'success');
      } else {
        await carService.updateCar(editingId, formData);
        showToast(`Vehicle details updated successfully!`, 'success');
      }
      setModalOpen(false);
      fetchCars();
    } catch (err) {
      const msg = err.response?.data?.message || 'Operation failed. Check if registration number already exists.';
      setFormError(msg);
      showToast(msg, 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const handleOpenDelete = (car) => {
    setCarToDelete(car);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!carToDelete) return;
    setDeleting(true);
    try {
      const res = await carService.deleteCar(carToDelete.car_id);
      showToast(res.message || 'Vehicle record updated.', 'success');
      setDeleteDialogOpen(false);
      setCarToDelete(null);
      fetchCars();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete vehicle.';
      showToast(msg, 'error');
    } finally {
      setDeleting(false);
    }
  };

  const filteredCars = cars.filter((c) => {
    const matchesSearch =
      searchTerm === '' ||
      `${c.brand} ${c.model}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.registration_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || (c.category && c.category.toUpperCase() === categoryFilter);
    const matchesStatus = statusFilter === 'ALL' || c.status.toUpperCase() === statusFilter;
    const matchesFuel = fuelFilter === 'ALL' || c.fuel_type.toUpperCase() === fuelFilter;
    return matchesSearch && matchesCategory && matchesStatus && matchesFuel;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Car className="w-6 h-6 text-indigo-500" />
            Car Fleet Inventory Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Add new inventory, update specifications, track maintenance statuses, view booking histories, or deactivate vehicles.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add New Vehicle
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search by brand, model, license plate..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Category filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Categories</option>
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat.toUpperCase()}>{cat}</option>
            ))}
          </select>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="AVAILABLE">Available</option>
            <option value="RENTED">Rented</option>
            <option value="MAINTENANCE">Maintenance</option>
            <option value="INACTIVE">Inactive</option>
          </select>

          {/* Fuel filter */}
          <select
            value={fuelFilter}
            onChange={(e) => setFuelFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Fuel Types</option>
            <option value="PETROL">Petrol</option>
            <option value="DIESEL">Diesel</option>
            <option value="ELECTRIC">Electric</option>
            <option value="HYBRID">Hybrid</option>
            <option value="CNG">CNG</option>
          </select>
        </div>
      </div>

      {/* Cars Data Table */}
      {loading ? (
        <LoadingSpinner message="Fetching fleet records..." />
      ) : filteredCars.length === 0 ? (
        <EmptyState
          title="No vehicles found"
          description="No cars matched your current filter criteria."
          actionLabel="Add New Vehicle"
          onAction={handleOpenAdd}
        />
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Car ID</th>
                  <th className="py-3.5 px-4">Vehicle Details</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Specs</th>
                  <th className="py-3.5 px-4">Daily Rate</th>
                  <th className="py-3.5 px-4">Fleet Status</th>
                  <th className="py-3.5 px-4">Featured</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredCars.map((car) => (
                  <tr key={car.car_id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-white">
                      #{car.car_id}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={car.image}
                          alt={`${car.brand} ${car.model}`}
                          className="w-14 h-10 object-cover rounded-lg bg-slate-950 shrink-0 border border-slate-800"
                        />
                        <div>
                          <div className="font-bold text-white text-sm">
                            {car.brand} {car.model}
                          </div>
                          <div className="text-[11px] text-indigo-400 font-mono">
                            {car.registration_number} ({car.year})
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-950 text-blue-300 border border-slate-700">
                        {car.category || 'Sedan'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-slate-300 font-medium">
                        {car.fuel_type} • {car.transmission}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {car.seats} Seats • {car.mileage}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-black text-white text-sm">
                        {formatINR(car.price_per_day)}
                      </div>
                      <div className="text-[10px] text-slate-500">per 24 hours</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <StatusBadge status={car.status} />
                    </td>

                    <td className="py-3.5 px-4">
                      {car.is_featured ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          Featured
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-600">Standard</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenHistory(car)}
                          className="p-1.5 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-colors"
                          title="View Car Booking History"
                        >
                          <History className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(car)}
                          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                          title="Edit vehicle details"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenDelete(car)}
                          className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors"
                          title="Delete or de-activate vehicle"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Car Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-600/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
                  <Car className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {modalMode === 'add' ? 'Add New Fleet Vehicle' : `Edit Vehicle #${editingId}`}
                  </h3>
                  <p className="text-xs text-slate-400">Specify specs, category, pricing, and availability</p>
                </div>
              </div>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Brand / Manufacturer <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Toyota, Mahindra, Hyundai"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Model & Variant <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Innova Hycross ZX"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Registration Plate <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. DL-01-AB-1234"
                    value={formData.registration_number}
                    onChange={(e) => setFormData({ ...formData, registration_number: e.target.value.toUpperCase() })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Category <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    {CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Daily Rental Rate (₹) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="number"
                    min="100"
                    step="50"
                    required
                    placeholder="e.g. 2500"
                    value={formData.price_per_day}
                    onChange={(e) => setFormData({ ...formData, price_per_day: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Model Year
                  </label>
                  <input
                    type="number"
                    min="2015"
                    max="2030"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) || 2024 })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Fuel Type
                  </label>
                  <select
                    value={formData.fuel_type}
                    onChange={(e) => setFormData({ ...formData, fuel_type: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Petrol">Petrol</option>
                    <option value="Diesel">Diesel</option>
                    <option value="Electric">Electric</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="CNG">CNG</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Transmission
                  </label>
                  <select
                    value={formData.transmission}
                    onChange={(e) => setFormData({ ...formData, transmission: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Automatic">Automatic</option>
                    <option value="Manual">Manual</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Seating Capacity
                  </label>
                  <select
                    value={formData.seats}
                    onChange={(e) => setFormData({ ...formData, seats: parseInt(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value={4}>4 Seats</option>
                    <option value={5}>5 Seats</option>
                    <option value={7}>7 Seats</option>
                    <option value={8}>8 Seats</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Mileage / Efficiency
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 18.4 km/l or 465 km range"
                    value={formData.mileage}
                    onChange={(e) => setFormData({ ...formData, mileage: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Operational Fleet Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Available">Available for Rental</option>
                    <option value="Rented">Currently Rented</option>
                    <option value="Maintenance">Under Scheduled Maintenance</option>
                    <option value="Inactive">Decommissioned / Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Car Image URL <span className="text-rose-400">*</span>
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://images.unsplash.com/..."
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
                {formData.image && (
                  <div className="mt-2 flex items-center gap-3 p-2 rounded-xl bg-slate-950 border border-slate-800">
                    <img
                      src={formData.image}
                      alt="Preview"
                      className="w-16 h-11 object-cover rounded-lg bg-slate-900"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                    <span className="text-[11px] text-slate-400">Live image preview</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Description & Key Equipment
                </label>
                <textarea
                  rows={2}
                  placeholder="Describe key features, comfort, safety specifications, and luggage space..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="featuredCheckbox"
                  checked={formData.is_featured}
                  onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-700 bg-slate-950"
                />
                <label htmlFor="featuredCheckbox" className="text-xs text-slate-300 cursor-pointer">
                  Feature this vehicle on the homepage top showcase
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/20 disabled:opacity-50 transition-all"
                >
                  {formLoading ? 'Saving Vehicle...' : modalMode === 'add' ? 'Add Vehicle to Fleet' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Car Booking History Modal (User Story 3) */}
      {historyModalOpen && historyCar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl space-y-5 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600/15 border border-blue-500/30 text-blue-400 flex items-center justify-center">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Booking History: {historyCar.brand} {historyCar.model}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    Plate: {historyCar.registration_number} • Status: {historyCar.status}
                  </p>
                </div>
              </div>
              <button onClick={() => setHistoryModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {historyLoading ? (
              <LoadingSpinner message="Retrieving vehicle rental log..." />
            ) : carBookings.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                <Calendar className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                No past or upcoming bookings registered for this vehicle yet.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 font-semibold text-[10px] uppercase tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3">Booking ID</th>
                      <th className="py-2.5 px-3">Customer</th>
                      <th className="py-2.5 px-3">Dates</th>
                      <th className="py-2.5 px-3">Duration</th>
                      <th className="py-2.5 px-3">Total Amount</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {carBookings.map((b) => (
                      <tr key={b.booking_id} className="hover:bg-slate-800/30">
                        <td className="py-2.5 px-3 font-mono font-bold text-blue-400">
                          #{b.booking_id}
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="font-semibold text-white">{b.customer_name}</div>
                          <div className="text-[10px] text-slate-400">{b.customer_phone || b.customer_email}</div>
                        </td>
                        <td className="py-2.5 px-3 text-slate-300">
                          {formatDate(b.pickup_date)} → {formatDate(b.return_date)}
                        </td>
                        <td className="py-2.5 px-3 font-medium">
                          {b.rental_days} Days
                        </td>
                        <td className="py-2.5 px-3 font-bold text-white">
                          {formatINR(b.total_amount)}
                        </td>
                        <td className="py-2.5 px-3">
                          <StatusBadge status={b.booking_status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button
                onClick={() => setHistoryModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                Close Log
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog for Deactivation / Removal */}
      <ConfirmationDialog
        isOpen={deleteDialogOpen}
        title="Deactivate / Remove Vehicle"
        message={`Are you sure you want to remove ${carToDelete?.brand} ${carToDelete?.model} (${carToDelete?.registration_number})? If historical bookings exist, the vehicle will be safely deactivated rather than deleted to preserve foreign key audit trails.`}
        confirmText={deleting ? 'Processing...' : 'Proceed'}
        type="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteDialogOpen(false)}
      />
    </div>
  );
};

export default AdminCarsPage;
