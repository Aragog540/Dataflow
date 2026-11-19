import BaseNode from './BaseNode';
import usePipelineStore from '../store';

export default function PivotNode({ id, type, data }) {
  const update = usePipelineStore((s) => s.updateNodeData);
  return (
    <BaseNode id={id} type={type} data={data}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <label style={labelStyle}>Index (Row Column)</label>
        <input
          placeholder="e.g. region"
          value={data.index ?? ''}
          onChange={(e) => update(id, { index: e.target.value })}
          onClick={(e) => e.stopPropagation()}
          style={inputStyle}
        />
        <label style={labelStyle}>Columns (Header Column)</label>
        <input
          placeholder="e.g. product"
          value={data.columns ?? ''}
          onChange={(e) => update(id, { columns: e.target.value })}
          onClick={(e) => e.stopPropagation()}
          style={inputStyle}
        />
        <label style={labelStyle}>Values (Aggregated Metric)</label>
        <input
          placeholder="e.g. revenue"
          value={data.values ?? ''}
          onChange={(e) => update(id, { values: e.target.value })}
          onClick={(e) => e.stopPropagation()}
          style={inputStyle}
        />
        <label style={labelStyle}>Aggregation</label>
        <select
          value={data.aggfunc ?? 'sum'}
          onChange={(e) => update(id, { aggfunc: e.target.value })}
          onClick={(e) => e.stopPropagation()}
          style={inputStyle}
        >
          <option value="sum">Sum</option>
          <option value="mean">Mean</option>
          <option value="count">Count</option>
          <option value="min">Min</option>
          <option value="max">Max</option>
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
