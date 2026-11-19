import BaseNode from './BaseNode';
import usePipelineStore from '../store';

export default function SliceNode({ id, type, data }) {
  const update = usePipelineStore((s) => s.updateNodeData);
  return (
    <BaseNode id={id} type={type} data={data}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <label style={labelStyle}>Slice Mode</label>
        <select
          value={data.mode ?? 'head'}
          onChange={(e) => update(id, { mode: e.target.value })}
          onClick={(e) => e.stopPropagation()}
          style={inputStyle}
        >
          <option value="head">Top N Rows (Head)</option>
          <option value="tail">Bottom N Rows (Tail)</option>
          <option value="range">Row Index Range</option>
        </select>
        {data.mode === 'range' ? (
          <div style={{ display: 'flex', gap: 4 }}>
            <input
              type="number"
              placeholder="start"
              value={data.start ?? 0}
              onChange={(e) => update(id, { start: parseInt(e.target.value, 10) || 0 })}
              onClick={(e) => e.stopPropagation()}
              style={{ ...inputStyle, width: '50%' }}
            />
            <input
              type="number"
              placeholder="end"
              value={data.end ?? 10}
              onChange={(e) => update(id, { end: parseInt(e.target.value, 10) || 10 })}
              onClick={(e) => e.stopPropagation()}
              style={{ ...inputStyle, width: '50%' }}
            />
          </div>
        ) : (
          <input
            type="number"
            min={1}
            value={data.count ?? 10}
            onChange={(e) => update(id, { count: parseInt(e.target.value, 10) || 1 })}
            onClick={(e) => e.stopPropagation()}
            style={inputStyle}
          />
        )}
      </div>
    </BaseNode>
  );
}

const labelStyle = { color: '#94a3b8', fontSize: 10 };
const inputStyle = {
  background: '#0f172a', border: '1px solid #334155', borderRadius: 4,
  color: '#e2e8f0', fontSize: 11, padding: '3px 6px', width: '100%', boxSizing: 'border-box',
};
