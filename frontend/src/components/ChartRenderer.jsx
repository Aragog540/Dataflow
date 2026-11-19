export default function ChartRenderer({ chartType, columns, rows, xCol, yCol }) {
  const margin = { top: 10, right: 10, bottom: 50, left: 40 };
  const svgW = 400, svgH = 220;
  const chartW = svgW - margin.left - margin.right; // 350
  const chartH = svgH - margin.top - margin.bottom; // 160

  const hasX = columns && columns.includes(xCol);
  const hasY = columns && columns.includes(yCol);

  if (!hasX || !hasY) {
    return (
      <div style={{ background: '#1e293b', borderRadius: 8, padding: 12, color: '#64748b', fontSize: 12, textAlign: 'center', paddingTop: 40, paddingBottom: 40 }}>
        Configure X/Y axis in node inspector
      </div>
    );
  }

  const xIdx = columns.indexOf(xCol);
  const yIdx = columns.indexOf(yCol);
  const rawData = (rows || []).slice(0, 50).map(r => ({ x: r[xIdx], y: parseFloat(r[yIdx]) || 0 }));

  const maxY = Math.max(...rawData.map(d => d.y), 1);
  const minY = Math.min(...rawData.map(d => d.y), 0);
  const yRange = maxY - minY || 1;

  const normalize = (val) => chartH - ((val - minY) / yRange) * chartH;

  const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  const renderBarChart = () => {
    const barSlotW = chartW / (rawData.length || 1);
    const barW = barSlotW * 0.7;
    const gap = barSlotW * 0.15;
    return rawData.map((d, i) => {
      const normalizedH = Math.max(1, ((d.y - minY) / yRange) * chartH);
      const x = margin.left + i * barSlotW + gap;
      const y = margin.top + (chartH - normalizedH);
      return (
        <g key={i}>
          <rect x={x} y={y} width={barW} height={normalizedH} fill="#3b82f6" />
          <text
            x={x + barW / 2}
            y={margin.top + chartH + 12}
            fontSize={8}
            textAnchor="end"
            fill="#94a3b8"
            transform={`rotate(-40, ${x + barW / 2}, ${margin.top + chartH + 12})`}
          >
            {String(d.x).slice(0, 10)}
          </text>
        </g>
      );
    });
  };

  const renderLineChart = () => {
    if (rawData.length === 0) return null;
    const pts = rawData.map((d, i) => {
      const cx = margin.left + (i / (rawData.length - 1 || 1)) * chartW;
      const cy = margin.top + normalize(d.y);
      return `${cx},${cy}`;
    });
    return (
      <g>
        <polyline points={pts.join(' ')} stroke="#10b981" fill="none" strokeWidth={2} />
        {rawData.map((d, i) => {
          const cx = margin.left + (i / (rawData.length - 1 || 1)) * chartW;
          const cy = margin.top + normalize(d.y);
          return <circle key={i} cx={cx} cy={cy} r={3} fill="#10b981" />;
        })}
      </g>
    );
  };

  const renderPieChart = () => {
    const cx = 200, cy = 110, r = 90;
    const total = rawData.reduce((s, d) => s + Math.abs(d.y), 0) || 1;
    let angle = -Math.PI / 2;
    const slices = rawData.slice(0, 5).map((d, i) => {
      const slice = (Math.abs(d.y) / total) * 2 * Math.PI;
      const x1 = cx + r * Math.cos(angle);
      const y1 = cy + r * Math.sin(angle);
      const x2 = cx + r * Math.cos(angle + slice);
      const y2 = cy + r * Math.sin(angle + slice);
      const large = slice > Math.PI ? 1 : 0;
      const path = `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large},1 ${x2},${y2} Z`;
      const midA = angle + slice / 2;
      const lx = cx + (r + 15) * Math.cos(midA);
      const ly = cy + (r + 15) * Math.sin(midA);
      angle += slice;
      return { path, color: PIE_COLORS[i % PIE_COLORS.length], label: String(d.x).slice(0, 8), lx, ly };
    });
    return (
      <g>
        {slices.map((s, i) => <path key={i} d={s.path} fill={s.color} />)}
        {slices.map((s, i) => (
          <text key={i} x={s.lx} y={s.ly} fontSize={7} fill="#e2e8f0" textAnchor="middle">{s.label}</text>
        ))}
      </g>
    );
  };

  const renderScatter = () => {
    const xVals = rawData.map(d => parseFloat(d.x) || 0);
    const maxX = Math.max(...xVals, 1);
    const minX = Math.min(...xVals, 0);
    const xRange = maxX - minX || 1;
    return rawData.map((d, i) => {
      const cx = margin.left + ((parseFloat(d.x) || 0 - minX) / xRange) * chartW;
      const cy = margin.top + normalize(d.y);
      return <circle key={i} cx={cx} cy={cy} r={4} fill="#6366f1" />;
    });
  };

  const yLabels = [0, 1, 2, 3].map(i => {
    const val = minY + (yRange * i) / 3;
    const y = margin.top + chartH - (i / 3) * chartH;
    return { val: val.toFixed(1), y };
  });

  return (
    <div style={{ background: '#1e293b', borderRadius: 8, padding: 12 }}>
      <svg width="100%" viewBox={`0 0 ${svgW} ${svgH}`} preserveAspectRatio="xMidYMid meet">
        {/* Y-axis gridlines */}
        {yLabels.map((l, i) => (
          <g key={i}>
            <line x1={margin.left} y1={l.y} x2={margin.left + chartW} y2={l.y} stroke="#334155" strokeDasharray="3,3" />
            <text x={margin.left - 4} y={l.y + 3} fontSize={8} fill="#64748b" textAnchor="end">{l.val}</text>
          </g>
        ))}
        {/* X-axis baseline */}
        <line x1={margin.left} y1={margin.top + chartH} x2={margin.left + chartW} y2={margin.top + chartH} stroke="#475569" />
        {/* Y-axis line */}
        <line x1={margin.left} y1={margin.top} x2={margin.left} y2={margin.top + chartH} stroke="#475569" />

        {chartType === 'bar' && renderBarChart()}
        {chartType === 'line' && renderLineChart()}
        {chartType === 'pie' && renderPieChart()}
        {chartType === 'scatter' && renderScatter()}
        {!['bar', 'line', 'pie', 'scatter'].includes(chartType) && renderBarChart()}
      </svg>
    </div>
  );
}
