import BaseNode from './BaseNode';
import usePipelineStore from '../store';

export default function SortNode({ id, type, data }) {
  const update = usePipelineStore((s) => s.updateNodeData);
  return (
    <BaseNode id={id} type={type} data={data}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <label style={labelStyle}>Sort By Column(s)</label>
        <input
          placeholder="revenue, order_id"
          value={data.by ?? ''}
          onChange={(e) => update(id, { by: e.target.value })}
          onClick={(e) => e.stopPropagation()}
          style={inputStyle}
        />
        <label style={labelStyle}>Order</label>
        <select
          value={data.ascending !== false ? 'asc' : 'desc'}
          onChange={(e) => update(id, { ascending: e.target.value === 'asc' })}
          onClick={(e) => e.stopPropagation()}
          style={inputStyle}
        >
          <option value="asc">Ascending (Smallest First)</option>
          <option value="desc">Descending (Largest First)</option>
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
