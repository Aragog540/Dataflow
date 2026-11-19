import BaseNode from './BaseNode';
import usePipelineStore from '../store';

export default function GroupByNode({ id, type, data }) {
  const update = usePipelineStore((s) => s.updateNodeData);
  return (
    <BaseNode id={id} type={type} data={data}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <label style={labelStyle}>Group by columns</label>
        <input
          placeholder="region, product …"
          value={data.groupBy?.join(', ') ?? ''}
          onChange={(e) =>
            update(id, { groupBy: e.target.value.split(',').map((c) => c.trim()).filter(Boolean) })
          }
          onClick={(e) => e.stopPropagation()}
          style={inputStyle}
        />
        <label style={labelStyle}>Aggregations (col:func, …)</label>
        <input
          placeholder="revenue:sum, quantity:mean"
          value={
            data.agg && typeof data.agg === 'object'
              ? Object.entries(data.agg).map(([k, v]) => `${k}:${v}`).join(', ')
              : ''
          }
          onChange={(e) => {
            const agg = {};
            e.target.value.split(',').forEach((pair) => {
              const [k, v] = pair.split(':').map((s) => s.trim());
              if (k && v) agg[k] = v;
            });
            update(id, { agg });
          }}
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
