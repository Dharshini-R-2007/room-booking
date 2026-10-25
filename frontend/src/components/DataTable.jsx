import React from 'react';
import { Inbox } from 'lucide-react';

const DataTable = ({ columns, data, isLoading, emptyMessage = 'No records found.' }) => {
  return (
    <div className="custom-table-card">
      <div className="custom-table-wrapper">
        <table className="custom-table">
          <thead>
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} style={{ width: col.width || 'auto' }}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} style={{ textAlign: 'center', padding: '2.5rem' }}>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    Loading data...
                  </div>
                </td>
              </tr>
            ) : !data || data.length === 0 ? (
              <tr>
                <td colSpan={columns.length}>
                  <div className="table-empty-state">
                    <Inbox size={32} strokeWidth={1.5} style={{ color: '#9CA3AF' }} />
                    <span>{emptyMessage}</span>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row, rowIdx) => (
                <tr key={row.id || rowIdx}>
                  {columns.map((col, colIdx) => (
                    <td key={colIdx}>
                      {col.render ? col.render(row) : row[col.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;
