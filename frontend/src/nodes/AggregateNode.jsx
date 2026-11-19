import BaseNode from './BaseNode';
import usePipelineStore from '../store';

export default function AggregateNode({ id, type, data }) {
  const update = usePipelineStore((s) => s.updateNodeData);
  return (
    <BaseNode id={id} type={type} data={data}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <label style={labelStyle}>Aggregations (col:func, ...)</label>
        <input
          placeholder="revenue:sum, quantity:mean"
          value={
            data.aggregations && typeof data.aggregations === 'object'
              ? Object.entries(data.aggregations).map(([k, v]) => `${k}:${v}`).join(', ')
              : ''
          }
          onChange={(e) => {
            const aggs = {};
            e.target.value.split(',').forEach((pair) => {
              const [k, v] = pair.split(':').map((s) => s.trim());
              if (k && v) aggs[k] = v;
            });
            update(id, { aggregations: aggs });
          }}
          onClick={(e) => e.stopPropagation()}
          style={inputStyle}
        />
        <span style={{ color: '#64748b', fontSize: 10 }}>Calculates dataset-wide single row summary</span>
      </div>
    </BaseNode>
  );
}

const labelStyle = { color: '#94a3b8', fontSize: 10 };
const inputStyle = {
  background: '#0f172a', border: '1px solid #334155', borderRadius: 4,
  color: '#e2e8f0', fontSize: 11, padding: '3px 6px', width: '100%', boxSizing: 'border-box',
};
