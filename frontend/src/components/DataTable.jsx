import { useState, useCallback } from 'react';

const ROW_HEIGHT = 28;
const CONTAINER_HEIGHT = 300;
const OVERSCAN = 5;
const MAX_ROWS = 500;

export default function DataTable({ columns, rows }) {
  const [scrollTop, setScrollTop] = useState(0);

  const handleScroll = useCallback((e) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  if (!columns || columns.length === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, color: '#64748b', fontSize: 13 }}>
        No data
      </div>
    );
  }

  const displayRows = rows && rows.length > MAX_ROWS ? rows.slice(0, MAX_ROWS) : (rows || []);
  const totalHeight = displayRows.length * ROW_HEIGHT;

  const startIdx = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - OVERSCAN);
  const endIdx = Math.min(displayRows.length, Math.ceil((scrollTop + CONTAINER_HEIGHT) / ROW_HEIGHT) + OVERSCAN);

  const visibleRows = [];
  for (let i = startIdx; i < endIdx; i++) {
    visibleRows.push(i);
  }

  return (
    <div>
      {rows && rows.length > MAX_ROWS && (
        <div style={{ background: '#713f12', color: '#fde68a', padding: '4px 10px', fontSize: 11, borderRadius: 4, marginBottom: 6 }}>
          Showing first 500 rows
        </div>
      )}
      {/* Sticky header */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 1,
        background: '#1e3a5f',
        color: '#93c5fd',
        display: 'flex',
        fontSize: 11,
        fontWeight: 600,
        borderBottom: '1px solid #1e293b',
      }}>
        {columns.map((col, i) => (
          <div key={i} style={{ flex: 1, padding: '4px 8px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 80 }}>
            {col}
          </div>
        ))}
      </div>
      {/* Virtualized scroll container */}
      <div
        style={{ height: CONTAINER_HEIGHT, overflowY: 'auto', position: 'relative' }}
        onScroll={handleScroll}
      >
        <div style={{ height: totalHeight, position: 'relative' }}>
          {displayRows.length === 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: CONTAINER_HEIGHT, color: '#64748b', fontSize: 13 }}>
              No data
            </div>
          ) : (
            visibleRows.map((rowIdx) => {
              const row = displayRows[rowIdx];
              return (
                <div
                  key={rowIdx}
                  style={{
                    position: 'absolute',
                    top: rowIdx * ROW_HEIGHT,
                    left: 0,
                    right: 0,
                    display: 'flex',
                    fontSize: 11,
                    borderBottom: '1px solid #1e293b',
                    background: rowIdx % 2 === 0 ? '#0f172a' : '#1e293b',
                    height: ROW_HEIGHT,
                    alignItems: 'center',
                  }}
                >
                  {columns.map((_, colIdx) => (
                    <div
                      key={colIdx}
                      style={{ flex: 1, padding: '2px 8px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 80 }}
                    >
                      {row?.[colIdx] != null ? String(row[colIdx]) : ''}
                    </div>
                  ))}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
