// Currency & Date formatting utilities for CRMS

export const formatINR = (amount) => {
  const num = Number(amount) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(num);
};

export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'Available':
    case 'Active':
    case 'Completed':
    case 'Paid':
      return 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30';
    case 'Confirmed':
      return 'bg-blue-500/15 text-blue-400 border border-blue-500/30';
    case 'Pending':
    case 'Scheduled':
      return 'bg-amber-500/15 text-amber-400 border border-amber-500/30';
    case 'Rented':
    case 'In Progress':
      return 'bg-purple-500/15 text-purple-400 border border-purple-500/30';
    case 'Maintenance':
      return 'bg-orange-500/15 text-orange-400 border border-orange-500/30';
    case 'Cancelled':
    case 'Rejected':
    case 'Inactive':
    case 'Suspended':
    case 'Failed':
      return 'bg-rose-500/15 text-rose-400 border border-rose-500/30';
    case 'Refunded':
      return 'bg-slate-500/15 text-slate-400 border border-slate-500/30';
    default:
      return 'bg-slate-800 text-slate-300 border border-slate-700';
  }
};
