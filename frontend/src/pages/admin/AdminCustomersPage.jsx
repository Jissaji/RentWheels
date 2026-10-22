import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  UserCheck,
  UserX,
  Eye,
  CalendarCheck,
  Phone,
  Mail,
  MapPin,
  FileText,
  AlertCircle,
  X,
  Car
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import ConfirmationDialog from '../../components/ConfirmationDialog';
import { useToast } from '../../context/ToastContext';
import { formatDate, formatINR } from '../../utils/formatters';

const AdminCustomersPage = () => {
  const { showToast } = useToast();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Customer Detail + History modal
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerBookings, setCustomerBookings] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Status toggle confirmation
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'primary',
    action: null
  });

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const data = await adminService.getAllUsers({ role: 'Customer' });
      setCustomers(data.users || []);
    } catch (err) {
      console.error('Failed to load customers:', err);
      showToast('Could not load customer accounts.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleOpenDetails = async (customer) => {
    setLoadingDetails(true);
    try {
      const data = await adminService.getUserById(customer.user_id);
      setSelectedCustomer(data.user);
      setCustomerBookings(data.bookings || []);
    } catch (err) {
      showToast('Failed to load customer profile details.', 'error');
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleToggleStatus = (customer) => {
    const newStatus = customer.status === 'Active' ? 'Inactive' : 'Active';
    const isDeactivating = newStatus === 'Inactive';

    setConfirmDialog({
      isOpen: true,
      title: isDeactivating ? 'Deactivate Customer Account' : 'Reactivate Customer Account',
      message: `Are you sure you want to mark ${customer.name} as ${newStatus}? ${
        isDeactivating
          ? 'They will be prevented from logging in and making new bookings.'
          : 'They will regain access to their dashboard.'
      }`,
      type: isDeactivating ? 'danger' : 'primary',
      action: async () => {
        try {
          await adminService.updateUserStatus(customer.user_id, newStatus);
          showToast(`Customer account marked as ${newStatus}.`, 'success');
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
          if (selectedCustomer && selectedCustomer.user_id === customer.user_id) {
            setSelectedCustomer((prev) => ({ ...prev, status: newStatus }));
          }
          fetchCustomers();
        } catch (err) {
          const msg = err.response?.data?.message || 'Failed to update account status.';
          showToast(msg, 'error');
        }
      }
    });
  };

  const filteredCustomers = customers.filter((c) => {
    const matchesSearch =
      searchTerm === '' ||
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || c.status.toUpperCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-500" />
            Customer Accounts Directory
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Review registered drivers, check booking records, and control account active states.
          </p>
        </div>

        <button
          onClick={fetchCustomers}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all self-start sm:self-auto"
        >
          Refresh Customers
        </button>
      </div>

      {/* Search Toolbar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search by name, email, phone number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 w-full md:w-auto"
        >
          <option value="ALL">All Account Statuses</option>
          <option value="ACTIVE">Active Only</option>
          <option value="INACTIVE">Inactive Only</option>
          <option value="SUSPENDED">Suspended Only</option>
        </select>
      </div>

      {/* Customers Table */}
      {loading ? (
        <LoadingSpinner message="Loading customer directory..." />
      ) : filteredCustomers.length === 0 ? (
        <EmptyState
          title="No customers found"
          message="No customer profiles match your search criteria."
        />
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">User ID</th>
                  <th className="py-3.5 px-4">Customer Name</th>
                  <th className="py-3.5 px-4">Contact Info</th>
                  <th className="py-3.5 px-4">License Plate</th>
                  <th className="py-3.5 px-4">Registered Date</th>
                  <th className="py-3.5 px-4">Total Trips</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredCustomers.map((c) => (
                  <tr key={c.user_id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-white">
                      #{c.user_id}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white">{c.name}</div>
                      <div className="text-[11px] text-slate-400">{c.address || 'India'}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-slate-200">{c.email}</div>
                      <div className="text-[11px] text-indigo-400 font-mono">{c.phone}</div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-400">
                      {c.driving_license || 'DL-ON-FILE'}
                    </td>

                    <td className="py-3.5 px-4 text-slate-300">
                      {formatDate(c.created_at)}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-800 text-slate-200">
                        {c.total_bookings || 0}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <StatusBadge status={c.status} />
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenDetails(c)}
                          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                          title="View customer profile and booking history"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleToggleStatus(c)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            c.status === 'Active'
                              ? 'text-rose-400 hover:bg-rose-500/10'
                              : 'text-emerald-400 hover:bg-emerald-500/10'
                          }`}
                          title={c.status === 'Active' ? 'Deactivate customer' : 'Activate customer'}
                        >
                          {c.status === 'Active' ? (
                            <UserX className="w-4 h-4" />
                          ) : (
                            <UserCheck className="w-4 h-4" />
                          )}
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

      {/* Customer Details & History Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-base">
                  {selectedCustomer.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    {selectedCustomer.name}
                    <StatusBadge status={selectedCustomer.status} />
                  </h3>
                  <div className="text-[11px] text-slate-400">Customer ID #{selectedCustomer.user_id}</div>
                </div>
              </div>
              <button onClick={() => setSelectedCustomer(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile specifications */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs">
              <div>
                <span className="text-slate-500 block">Email Address</span>
                <span className="text-white font-medium break-all">{selectedCustomer.email}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Phone</span>
                <span className="text-white font-mono">{selectedCustomer.phone}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Driving License</span>
                <span className="text-indigo-400 font-mono font-semibold">{selectedCustomer.driving_license || 'DL-ON-FILE'}</span>
              </div>
              <div className="col-span-2 sm:col-span-3 pt-2 border-t border-slate-800">
                <span className="text-slate-500 block">Address</span>
                <span className="text-slate-300">{selectedCustomer.address || 'No residential address on file'}</span>
              </div>
            </div>

            {/* Customer Booking History */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <CalendarCheck className="w-4 h-4 text-blue-400" />
                  Booking History ({customerBookings.length})
                </h4>
              </div>

              {customerBookings.length === 0 ? (
                <div className="p-4 rounded-xl bg-slate-950/60 text-center text-xs text-slate-500">
                  This customer has not booked any cars yet.
                </div>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {customerBookings.map((b) => (
                    <div
                      key={b.booking_id}
                      className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={b.car_image}
                          alt={b.model}
                          className="w-10 h-7 object-cover rounded bg-slate-900 border border-slate-800"
                        />
                        <div>
                          <div className="font-bold text-white">
                            {b.brand} {b.model}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {formatDate(b.pickup_date)} &rarr; {formatDate(b.return_date)} ({b.rental_days}d)
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-bold text-white">{formatINR(b.total_amount)}</div>
                        <div className="mt-0.5">
                          <StatusBadge status={b.booking_status} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => handleToggleStatus(selectedCustomer)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedCustomer.status === 'Active'
                    ? 'text-rose-400 bg-rose-500/10 hover:bg-rose-500/20'
                    : 'text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20'
                }`}
              >
                {selectedCustomer.status === 'Active' ? 'Deactivate Customer' : 'Activate Customer'}
              </button>

              <button
                onClick={() => setSelectedCustomer(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                Close
              </button>
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

export default AdminCustomersPage;
