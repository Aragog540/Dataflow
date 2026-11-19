import BaseNode from './BaseNode';
import usePipelineStore from '../store';

export default function ScaleNormalizeNode({ id, type, data }) {
  const update = usePipelineStore((s) => s.updateNodeData);
  return (
    <BaseNode id={id} type={type} data={data}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <label style={labelStyle}>Columns (blank = all numeric)</label>
        <input
          placeholder="revenue, quantity..."
          value={data.columns?.join(', ') ?? ''}
          onChange={(e) =>
            update(id, { columns: e.target.value.split(',').map((c) => c.trim()).filter(Boolean) })
          }
          onClick={(e) => e.stopPropagation()}
          style={inputStyle}
        />
        <label style={labelStyle}>Scaling Method</label>
        <select
          value={data.method ?? 'minmax'}
          onChange={(e) => update(id, { method: e.target.value })}
          onClick={(e) => e.stopPropagation()}
          style={inputStyle}
        >
          <option value="minmax">Min-Max Scaling (0 to 1)</option>
          <option value="zscore">Z-Score Standardization (Mean=0, Std=1)</option>
          <option value="robust">Robust Scaling (IQR)</option>
          <option value="log">Log Transformation (log1p)</option>
        </select>
      </div>
    </BaseNode>
  );
}

const labelStyle = { color: '#94a3b8', fontSize: 10 };
const inputStyle = {
  background: '#0f172a', border: '1px solid #334155', borderRadius: 4,
  color: '#e2e8f0', fontSize: 11, padding: '3px 6px', width: '100%', boxSizing: 'border-box',
};
