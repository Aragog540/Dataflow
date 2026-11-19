export default function ProfilerView({ columns, rows }) {
  if (!columns || !columns.includes('column') || !columns.includes('dtype')) {
    return (
      <div style={{ color: '#64748b', fontSize: 12, textAlign: 'center', padding: '40px 0' }}>
        Run a Profiler node to see statistics.
      </div>
    );
  }

  const col = (name) => columns.indexOf(name);

  const thStyle = {
    background: '#1e3a5f',
    color: '#93c5fd',
    padding: '4px 8px',
    textAlign: 'left',
    fontSize: 11,
    fontWeight: 600,
    whiteSpace: 'nowrap',
  };
  const tdStyle = {
    padding: '3px 8px',
    borderBottom: '1px solid #1e293b',
    color: '#e2e8f0',
    fontSize: 11,
  };

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
        <thead>
          <tr>
            {['Column', 'Type', 'Count', 'Nulls', 'Null%', 'Min', 'Max', 'Mean'].map(h => (
              <th key={h} style={thStyle}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {(rows || []).map((row, i) => {
            const nullPct = parseFloat(row[col('null_pct')] ?? row[col('null%')] ?? 0) || 0;
            const barColor = nullPct > 20 ? '#ef4444' : nullPct > 5 ? '#f59e0b' : '#22c55e';
            return (
              <tr key={i}>
                <td style={tdStyle}>{row[col('column')] ?? ''}</td>
                <td style={tdStyle}>{row[col('dtype')] ?? ''}</td>
                <td style={tdStyle}>{row[col('count')] ?? ''}</td>
                <td style={tdStyle}>{row[col('nulls')] ?? row[col('null_count')] ?? ''}</td>
                <td style={tdStyle}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <div style={{ width: 60, background: '#1e293b', borderRadius: 2, height: 8, overflow: 'hidden', border: '1px solid #334155' }}>
                      <div style={{ width: `${Math.min(100, nullPct)}%`, height: '100%', background: barColor }} />
                    </div>
                    <span style={{ fontSize: 10, color: '#94a3b8' }}>{nullPct.toFixed(1)}%</span>
                  </div>
                </td>
                <td style={tdStyle}>{row[col('min')] ?? ''}</td>
                <td style={tdStyle}>{row[col('max')] ?? ''}</td>
                <td style={tdStyle}>{row[col('mean')] ?? ''}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
