import BaseNode from './BaseNode';
import usePipelineStore from '../store';

export default function ConcatNode({ id, type, data }) {
  const update = usePipelineStore((s) => s.updateNodeData);
  return (
    <BaseNode id={id} type={type} data={data}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <label style={labelStyle}>Stacking Axis</label>
        <select
          value={data.axis ?? 0}
          onChange={(e) => update(id, { axis: parseInt(e.target.value, 10) })}
          onClick={(e) => e.stopPropagation()}
          style={inputStyle}
        >
          <option value={0}>Rows (Vertical Concatenation)</option>
          <option value={1}>Columns (Horizontal Concatenation)</option>
        </select>
        <span style={{ color: '#059669', fontSize: 10, marginTop: 2 }}>🧱 Stacks multiple inputs</span>
      </div>
    </BaseNode>
  );
}

const labelStyle = { color: '#94a3b8', fontSize: 10 };
const inputStyle = {
  background: '#0f172a', border: '1px solid #334155', borderRadius: 4,
  color: '#e2e8f0', fontSize: 11, padding: '3px 6px', width: '100%', boxSizing: 'border-box',
};
