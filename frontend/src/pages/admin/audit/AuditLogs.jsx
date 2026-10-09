import React, { useState, useEffect } from 'react';
import { adminService } from '../../../services/adminService';
import { formatDateTime } from '../../../utils/dateUtils';
import DataTable from '../../../components/DataTable';
import Loading from '../../../components/Loading';
import ErrorMessage from '../../../components/ErrorMessage';
import { History, Shield } from 'lucide-react';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminService.getAuditLogs({ limit: 100 });
      if (res.success) setLogs(res.data || []);
    } catch (err) {
      setError(err.userMessage || 'Failed to fetch audit logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const columns = [
    {
      header: 'Timestamp',
      accessor: (row) => (
        <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
          {formatDateTime(row.created_at)}
        </span>
      )
    },
    {
      header: 'Staff / Admin',
      accessor: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Shield size={14} color="var(--accent)" />
          <strong>{row.user_name || 'System'}</strong>
        </div>
      )
    },
    {
      header: 'Action Taken',
      accessor: (row) => (
        <span className="badge badge-amber" style={{ fontSize: '0.65rem' }}>
          {row.action}
        </span>
      )
    },
    {
      header: 'Target Entity',
      accessor: (row) => (
        <span style={{ textTransform: 'capitalize', fontSize: '0.8125rem' }}>
          {row.entity_type} {row.entity_id ? `(#${row.entity_id})` : ''}
        </span>
      )
    },
    {
      header: 'Details & Change Description',
      accessor: (row) => (
        <span style={{ fontSize: '0.8125rem', color: 'var(--text-main)' }}>
          {row.details || '—'}
        </span>
      )
    }
  ];

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 className="heading-serif" style={{ fontSize: '1.75rem', color: 'var(--primary)' }}>
          Workshop Activity Audit Logs
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          Chronological audit trail detailing every administrative action, customer record creation, measurement alteration, and order milestone change.
        </p>
      </div>

      {error && <ErrorMessage message={error} retry={fetchLogs} />}

      <DataTable
        columns={columns}
        data={logs}
        loading={loading}
        emptyMessage="No audit logs recorded yet."
      />
    </div>
  );
};

export default AuditLogs;
