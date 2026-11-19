import BaseNode from './BaseNode';
import usePipelineStore from '../store';

export default function SelectColumnsNode({ id, type, data }) {
  const update = usePipelineStore((s) => s.updateNodeData);
  return (
    <BaseNode id={id} type={type} data={data}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <label style={labelStyle}>Columns to Select & Reorder</label>
        <input
          placeholder="order_id, region, revenue"
          value={data.columns?.join(', ') ?? ''}
          onChange={(e) =>
            update(id, { columns: e.target.value.split(',').map((c) => c.trim()).filter(Boolean) })
          }
          onClick={(e) => e.stopPropagation()}
          style={inputStyle}
        />
        <span style={{ color: '#64748b', fontSize: 10 }}>Outputs columns in exact listed order</span>
      </div>
    </BaseNode>
  );
}

const labelStyle = { color: '#94a3b8', fontSize: 10 };
const inputStyle = {
  background: '#0f172a', border: '1px solid #334155', borderRadius: 4,
  color: '#e2e8f0', fontSize: 11, padding: '3px 6px', width: '100%', boxSizing: 'border-box',
};
