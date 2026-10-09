import React from 'react';
import {
  Clock,
  CheckCircle2,
  Package,
  Truck,
  CheckCheck,
  XCircle,
  AlertTriangle,
  CreditCard
} from 'lucide-react';

export default function StatusBadge({ status, type = 'order' }) {
  if (!status) return null;

  const normalized = String(status).toUpperCase();

  const configs = {
    ORDER_PLACED: { label: 'Order Placed', className: 'badge-placed', icon: Clock },
    CONFIRMED: { label: 'Confirmed', className: 'badge-confirmed', icon: CheckCircle2 },
    PROCESSING: { label: 'In Progress', className: 'badge-processing', icon: Package },
    SHIPPED: { label: 'Shipped', className: 'badge-shipped', icon: Truck },
    OUT_FOR_DELIVERY: { label: 'Out for Delivery', className: 'badge-shipped', icon: Truck },
    DELIVERED: { label: 'Delivered', className: 'badge-delivered', icon: CheckCheck },
    CORRECTION_REQUIRED: { label: 'Correction Required', className: 'badge-cancelled', icon: AlertTriangle },
    CANCELLED: { label: 'Cancelled', className: 'badge-cancelled', icon: XCircle },
    REJECTED: { label: 'Rejected', className: 'badge-rejected', icon: XCircle },

    // Payment statuses
    PENDING: { label: 'Pending Advance', className: 'badge-pending', icon: Clock },
    SUBMITTED: { label: 'Verification Pending', className: 'badge-processing', icon: CreditCard },
    VERIFIED: { label: 'Advance Verified', className: 'badge-verified', icon: CheckCircle2 },
    PAID: { label: 'Fully Paid', className: 'badge-delivered', icon: CheckCheck },
    PARTIALLY_PAID: { label: 'Partially Paid', className: 'badge-confirmed', icon: CreditCard },
    REFUNDED: { label: 'Refunded', className: 'badge-cancelled', icon: XCircle },
  };

  const config = configs[normalized] || {
    label: normalized.replace(/_/g, ' '),
    className: 'badge-placed',
    icon: Clock
  };

  const Icon = config.icon;

  return (
    <span className={`badge ${config.className}`}>
      <Icon size={12} />
      <span>{config.label}</span>
    </span>
  );
}
