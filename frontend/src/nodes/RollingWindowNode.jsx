import BaseNode from './BaseNode';
import usePipelineStore from '../store';

export default function RollingWindowNode({ id, type, data }) {
  const update = usePipelineStore((s) => s.updateNodeData);
  return (
    <BaseNode id={id} type={type} data={data}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <label style={labelStyle}>Target Column</label>
        <input
          placeholder="e.g. revenue"
          value={data.column ?? ''}
          onChange={(e) => update(id, { column: e.target.value })}
          onClick={(e) => e.stopPropagation()}
          style={inputStyle}
        />
        <label style={labelStyle}>Window Size (Rows)</label>
        <input
          type="number"
          min={1}
          max={100}
          value={data.window ?? 3}
          onChange={(e) => update(id, { window: parseInt(e.target.value, 10) || 1 })}
          onClick={(e) => e.stopPropagation()}
          style={inputStyle}
        />
        <label style={labelStyle}>Aggregation</label>
        <select
          value={data.agg ?? 'mean'}
          onChange={(e) => update(id, { agg: e.target.value })}
          onClick={(e) => e.stopPropagation()}
          style={inputStyle}
        >
          <option value="mean">Mean / SMA</option>
          <option value="sum">Sum</option>
          <option value="min">Min</option>
          <option value="max">Max</option>
          <option value="std">Standard Deviation</option>
        </select>
        <label style={labelStyle}>Output Column Name</label>
        <input
          placeholder="leave blank for auto"
          value={data.newColumn ?? ''}
          onChange={(e) => update(id, { newColumn: e.target.value })}
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
