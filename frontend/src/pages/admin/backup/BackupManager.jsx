import React, { useState, useEffect } from 'react';
import { backupService } from '../../../services/adminService';
import { formatDate, formatDateTime } from '../../../utils/dateUtils';
import DataTable from '../../../components/DataTable';
import Loading from '../../../components/Loading';
import ErrorMessage from '../../../components/ErrorMessage';
import { useNotifications } from '../../../context/NotificationContext';
import { Database, Download, ShieldCheck, HardDrive, RefreshCw } from 'lucide-react';

const BackupManager = () => {
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);

  const { showToast } = useNotifications();

  const fetchBackups = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await backupService.listBackups();
      if (res.success) setBackups(res.data || []);
    } catch (err) {
      setError(err.userMessage || 'Failed to list database backups.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBackups();
  }, []);

  const handleCreateBackup = async () => {
    try {
      setCreating(true);
      const res = await backupService.createBackup();
      if (res.success) {
        showToast(`Database backup created! (${(res.data.sizeBytes / 1024).toFixed(1)} KB)`, 'success');
        fetchBackups();
      }
    } catch (err) {
      alert(err.userMessage || 'Failed to create backup.');
    } finally {
      setCreating(false);
    }
  };

  const columns = [
    {
      header: 'Backup Filename',
      accessor: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <HardDrive size={16} color="var(--accent)" />
          <strong style={{ fontSize: '0.85rem' }}>{row.filename}</strong>
        </div>
      )
    },
    {
      header: 'Created Timestamp',
      accessor: (row) => (
        <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
          {formatDateTime(row.created_at)}
        </span>
      )
    },
    {
      header: 'File Size',
      accessor: (row) => (
        <span style={{ fontSize: '0.8125rem' }}>
          {(row.sizeBytes / 1024).toFixed(2)} KB
        </span>
      )
    },
    {
      header: 'Action',
      align: 'right',
      accessor: (row) => (
        <a
          href={backupService.getDownloadUrl(row.filename)}
          download
          className="btn btn-secondary btn-sm"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
        >
          <Download size={14} /> Download Securely
        </a>
      )
    }
  ];

  return (
    <div>
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
            Database Backup & Export Center
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Safeguard tailor notebook records with on-demand snapshot backups of customers, versioned measurements, orders, and financials.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={handleCreateBackup}
          disabled={creating}
        >
          <Database size={16} /> {creating ? 'Generating Snapshot...' : 'Create Backup'}
        </button>
      </div>

      {error && <ErrorMessage message={error} retry={fetchBackups} />}

      {/* Security Info Card */}
      <div className="card" style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '1rem 1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <ShieldCheck size={18} color="#15803d" />
          <strong style={{ fontSize: '0.875rem', color: '#15803d' }}>Secure Server-Side Storage</strong>
        </div>
        <p style={{ fontSize: '0.8125rem', color: '#166534', lineHeight: 1.5 }}>
          Backups are saved securely in the private server directory without exposing any database passwords or internal credentials to the client. Only authenticated administrators can download backups.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={backups}
        loading={loading}
        emptyMessage="No backups generated yet. Click 'Create Backup' to take a snapshot of the database."
      />
    </div>
  );
};

export default BackupManager;
