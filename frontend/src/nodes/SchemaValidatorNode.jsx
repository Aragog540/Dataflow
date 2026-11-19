import BaseNode from './BaseNode';
import usePipelineStore from '../store';

export default function SchemaValidatorNode({ id, type, data }) {
  const update = usePipelineStore((s) => s.updateNodeData);
  return (
    <BaseNode id={id} type={type} data={data}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <label style={labelStyle}>Required Columns (comma-sep)</label>
        <input
          placeholder="order_id, region, revenue"
          value={data.requiredColumns?.join(', ') ?? ''}
          onChange={(e) =>
            update(id, { requiredColumns: e.target.value.split(',').map((c) => c.trim()).filter(Boolean) })
          }
          onClick={(e) => e.stopPropagation()}
          style={inputStyle}
        />
        <label style={labelStyle}>Max Null Rate Allowed (%)</label>
        <input
          type="number"
          min={0}
          max={100}
          value={data.maxNullPct ?? 20}
          onChange={(e) => update(id, { maxNullPct: parseFloat(e.target.value) || 0 })}
          onClick={(e) => e.stopPropagation()}
          style={inputStyle}
        />
        <label style={labelStyle}>Min Expected Rows</label>
        <input
          type="number"
          min={0}
          value={data.minRows ?? 1}
          onChange={(e) => update(id, { minRows: parseInt(e.target.value, 10) || 0 })}
          onClick={(e) => e.stopPropagation()}
          style={inputStyle}
        />
      </div>
    </BaseNode>
  );
}

const labelStyle = { color: '#94a3b8', fontSize: 10 };
const inputStyle = {
  background: '#0f172a', border: '1px solid #334155', borderRadius: 4,
  color: '#e2e8f0', fontSize: 11, padding: '3px 6px', width: '100%', boxSizing: 'border-box',
};
