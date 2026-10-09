import React from 'react';
import Loading from './Loading';

const DataTable = ({
  columns = [],
  data = [],
  loading = false,
  emptyMessage = 'No records found',
  onRowClick,
  keyField = 'id'
}) => {
  if (loading) {
    return (
      <div className="table-container" style={{ padding: '2rem 0' }}>
        <Loading message="Fetching records..." />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="table-container" style={{ padding: '3.5rem 1rem', textAlign: 'center' }}>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.925rem' }}>
          ✂️ {emptyMessage}
        </div>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="custom-table">
        <thead>
          <tr>
            {columns.map((col, idx) => (
              <th 
                key={col.header || idx} 
                style={{ 
                  width: col.width || 'auto',
                  textAlign: col.align || 'left'
                }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIdx) => (
            <tr 
              key={row[keyField] || rowIdx}
              onClick={() => onRowClick && onRowClick(row)}
              style={{ cursor: onRowClick ? 'pointer' : 'default' }}
            >
              {columns.map((col, colIdx) => (
                <td 
                  key={colIdx}
                  style={{ textAlign: col.align || 'left' }}
                >
                  {typeof col.accessor === 'function'
                    ? col.accessor(row)
                    : row[col.accessor] != null
                      ? row[col.accessor]
                      : '—'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
