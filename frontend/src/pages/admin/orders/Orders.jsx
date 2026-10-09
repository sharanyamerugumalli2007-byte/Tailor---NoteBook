import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { orderService } from '../../../services/orderService';
import { formatDate } from '../../../utils/dateUtils';
import { formatCurrency } from '../../../utils/formatters';
import StatusBadge from '../../../components/StatusBadge';
import DataTable from '../../../components/DataTable';
import SearchBar from '../../../components/SearchBar';
import ErrorMessage from '../../../components/ErrorMessage';
import { Plus, Eye, Scissors, FileDown, Truck } from 'lucide-react';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');

  const navigate = useNavigate();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await orderService.getOrders({
        q: searchQuery,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        payment_status: paymentFilter !== 'all' ? paymentFilter : undefined
      });
      if (res.success && res.data) {
        setOrders(res.data.orders || []);
      }
    } catch (err) {
      setError(err.userMessage || 'Failed to fetch orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchOrders, 250);
    return () => clearTimeout(timer);
  }, [searchQuery, statusFilter, paymentFilter]);

  const columns = [
    {
      header: 'Order Number',
      accessor: (row) => (
        <div>
          <strong style={{ color: 'var(--accent)', fontSize: '0.925rem' }}>{row.order_number}</strong>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Placed: {formatDate(row.order_date)}
          </div>
        </div>
      )
    },
    {
      header: 'Customer',
      accessor: (row) => (
        <div>
          <div style={{ fontWeight: 600 }}>{row.customer_name}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{row.customer_phone}</div>
        </div>
      )
    },
    {
      header: 'Delivery Date',
      accessor: (row) => (
        <div>
          <span style={{ fontWeight: 500 }}>{formatDate(row.expected_delivery_date)}</span>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{row.delivery_type}</div>
        </div>
      )
    },
    {
      header: 'Financials',
      accessor: (row) => (
        <div>
          <div style={{ fontWeight: 700, color: 'var(--primary)' }}>{formatCurrency(row.total_amount)}</div>
          <div style={{ fontSize: '0.75rem', color: row.remaining_amount > 0 ? '#b91c1c' : '#15803d' }}>
            {row.remaining_amount > 0 ? `Due: ${formatCurrency(row.remaining_amount)}` : 'Fully Paid'}
          </div>
        </div>
      )
    },
    {
      header: 'Production Status',
      accessor: (row) => <StatusBadge status={row.status} />
    },
    {
      header: 'Shipment / Payment',
      accessor: (row) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
          <StatusBadge status={row.payment_status} />
          {row.tracking_number && (
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              🚚 {row.tracking_number}
            </span>
          )}
        </div>
      )
    },
    {
      header: 'Actions',
      align: 'right',
      accessor: (row) => (
        <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={(e) => { e.stopPropagation(); navigate(`/admin/orders/${row.id}`); }}
            title="View Order Details"
          >
            <Eye size={14} />
          </button>
          <button
            type="button"
            className="btn btn-outline-primary btn-sm"
            onClick={(e) => {
              e.stopPropagation();
              window.open(`/api/pdf/orders/${row.id}`, '_blank');
            }}
            title="Download Invoice PDF"
          >
            <FileDown size={14} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div>
      {/* Top Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        <div>
          <h2 className="heading-serif" style={{ fontSize: '1.75rem', color: 'var(--primary)' }}>
            Order Management & Production
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Track itemized bespoke garments, production pipeline statuses, advance payments, and delivery dates.
          </p>
        </div>

        <Link to="/admin/orders/new" className="btn btn-primary">
          <Plus size={16} /> Create New Order
        </Link>
      </div>

      {error && <ErrorMessage message={error} retry={fetchOrders} />}

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '1rem 1.25rem', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by order #, customer name, phone, or tracking..."
          onClear={() => setSearchQuery('')}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)' }}>Status:</label>
            <select
              className="form-control form-select"
              style={{ width: '170px' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="ORDER_RECEIVED">Order Received</option>
              <option value="CUTTING">Cutting</option>
              <option value="STITCHING">Stitching</option>
              <option value="TRIAL">Trial</option>
              <option value="READY">Ready</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)' }}>Payment:</label>
            <select
              className="form-control form-select"
              style={{ width: '160px' }}
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
            >
              <option value="all">All Payments</option>
              <option value="Pending">Pending</option>
              <option value="Partially Paid">Partially Paid</option>
              <option value="Paid">Fully Paid</option>
              <option value="Verification Pending">Verification Pending</option>
            </select>
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={orders}
        loading={loading}
        emptyMessage="No orders found matching the filter criteria."
        onRowClick={(row) => navigate(`/admin/orders/${row.id}`)}
      />
    </div>
  );
};

export default Orders;
