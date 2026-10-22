import React, { useState, useEffect } from 'react';
import {
  Wrench,
  Plus,
  Search,
  Filter,
  Calendar,
  IndianRupee,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Car,
  Trash2,
  Edit3,
  X,
  AlertCircle
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { carService } from '../../services/carService';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import ConfirmationDialog from '../../components/ConfirmationDialog';
import { useToast } from '../../context/ToastContext';
import { formatINR, formatDate } from '../../utils/formatters';

const initialMaintenanceState = {
  car_id: '',
  maintenance_type: 'Periodic Servicing',
  description: '',
  start_date: new Date().toISOString().split('T')[0],
  end_date: '',
  cost: '',
  status: 'Scheduled'
};

const AdminMaintenancePage = () => {
  const { showToast } = useToast();
  const [maintenanceList, setMaintenanceList] = useState([]);
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState(initialMaintenanceState);
  const [editingId, setEditingId] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // Delete confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [maintRes, carsRes] = await Promise.all([
        adminService.getAllMaintenance(),
        carService.getAllCars()
      ]);
      setMaintenanceList(maintRes.maintenance || []);
      setCars(carsRes.cars || []);
    } catch (err) {
      console.error('Failed to load maintenance records:', err);
      showToast('Could not load maintenance logs.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      ...initialMaintenanceState,
      car_id: cars[0]?.car_id || ''
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleOpenEdit = (rec) => {
    setEditingId(rec.maintenance_id);
    setFormData({
      car_id: rec.car_id,
      maintenance_type: rec.maintenance_type,
      description: rec.description,
      start_date: rec.start_date,
      end_date: rec.end_date || '',
      cost: rec.cost,
      status: rec.status
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.car_id || !formData.maintenance_type || !formData.description || !formData.start_date) {
      setFormError('Please fill in required fields (Vehicle, Type, Description, Start Date).');
      return;
    }

    setFormLoading(true);
    setFormError('');

    try {
      if (editingId) {
        await adminService.updateMaintenance(editingId, formData);
        showToast('Maintenance record updated successfully.', 'success');
      } else {
        await adminService.createMaintenance(formData);
        showToast('Maintenance logged. Vehicle status auto-synced.', 'success');
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save maintenance record.';
      setFormError(msg);
      showToast(msg, 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const handleOpenDelete = (rec) => {
    setRecordToDelete(rec);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!recordToDelete) return;
    try {
      await adminService.deleteMaintenance(recordToDelete.maintenance_id);
      showToast('Maintenance log removed.', 'success');
      setDeleteDialogOpen(false);
      setRecordToDelete(null);
      fetchData();
    } catch (err) {
      showToast('Failed to delete maintenance log.', 'error');
    }
  };

  const filteredList = maintenanceList.filter((m) => {
    const matchesSearch =
      searchTerm === '' ||
      m.maintenance_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.brand && m.brand.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (m.model && m.model.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (m.registration_number && m.registration_number.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || m.status.toUpperCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Wrench className="w-6 h-6 text-indigo-500" />
            Vehicle Servicing & Maintenance
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Schedule workshops, log repair costs, and automatically lock unavailable vehicles from client bookings.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Schedule Maintenance
        </button>
      </div>

      {/* Info notice banner */}
      <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/20 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
        <p className="text-xs text-indigo-200">
          <strong>Auto-Conflict Protection:</strong> When a vehicle is marked with <em>Scheduled</em> or <em>In Progress</em> maintenance, the reservation engine automatically denies customer bookings that overlap those service dates.
        </p>
      </div>

      {/* Filter bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search by vehicle, plate, service type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Maintenance Statuses</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="IN PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>

          <button
            onClick={fetchData}
            className="px-3 py-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 rounded-xl"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Maintenance Table */}
      {loading ? (
        <LoadingSpinner message="Loading maintenance schedules..." />
      ) : filteredList.length === 0 ? (
        <EmptyState
          title="No maintenance records found"
          message="No records match your criteria. You can log a new inspection or repair task."
          actionText="Log Maintenance"
          onAction={handleOpenAdd}
        />
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Log ID</th>
                  <th className="py-3.5 px-4">Vehicle</th>
                  <th className="py-3.5 px-4">Maintenance Type & Description</th>
                  <th className="py-3.5 px-4">Schedule Window</th>
                  <th className="py-3.5 px-4">Service Cost</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredList.map((m) => (
                  <tr key={m.maintenance_id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-white">
                      #{m.maintenance_id}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={m.car_image}
                          alt={m.model}
                          className="w-10 h-7 object-cover rounded bg-slate-950 border border-slate-800"
                        />
                        <div>
                          <div className="font-bold text-white">
                            {m.brand} {m.model}
                          </div>
                          <div className="text-[10px] text-indigo-400 font-mono">
                            {m.registration_number}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white">{m.maintenance_type}</div>
                      <div className="text-[11px] text-slate-400 max-w-xs truncate">
                        {m.description}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-slate-200">
                        {formatDate(m.start_date)} &rarr; {m.end_date ? formatDate(m.end_date) : 'Ongoing'}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-bold text-white">
                      {formatINR(m.cost)}
                    </td>

                    <td className="py-3.5 px-4">
                      <StatusBadge status={m.status} />
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(m)}
                          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                          title="Edit maintenance log"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenDelete(m)}
                          className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors"
                          title="Delete record"
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

      {/* Add / Edit Maintenance Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-600/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {editingId ? `Edit Maintenance #${editingId}` : 'Schedule Vehicle Maintenance'}
                  </h3>
                  <p className="text-xs text-slate-400">Record servicing details, costs, and downtime</p>
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
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Select Vehicle <span className="text-rose-400">*</span>
                </label>
                <select
                  required
                  value={formData.car_id}
                  onChange={(e) => setFormData({ ...formData, car_id: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="" disabled>Choose car from fleet...</option>
                  {cars.map((c) => (
                    <option key={c.car_id} value={c.car_id}>
                      {c.brand} {c.model} ({c.registration_number}) - Currently {c.status}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Maintenance Type <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={formData.maintenance_type}
                    onChange={(e) => setFormData({ ...formData, maintenance_type: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Periodic Servicing">Periodic Servicing</option>
                    <option value="Oil & Brake Replacement">Oil & Brake Replacement</option>
                    <option value="Tire Alignment & Balancing">Tire Alignment & Balancing</option>
                    <option value="AC & Electrical Repair">AC & Electrical Repair</option>
                    <option value="Engine Inspection">Engine Inspection</option>
                    <option value="Bodywork & Detailing">Bodywork & Detailing</option>
                    <option value="Other">Other Mechanical Work</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Scheduled">Scheduled</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Start Date <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Estimated End Date
                  </label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Cost (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 4500"
                    value={formData.cost}
                    onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Description & Technician Notes <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Detail the mechanical findings, spare parts replaced, technician workshop..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
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
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 shadow-md shadow-indigo-600/25 transition-all"
                >
                  {formLoading ? 'Saving...' : editingId ? 'Update Record' : 'Schedule Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Maintenance Record"
        message="Are you sure you want to remove this maintenance entry from the service history?"
        type="danger"
      />
    </div>
  );
};

export default AdminMaintenancePage;
