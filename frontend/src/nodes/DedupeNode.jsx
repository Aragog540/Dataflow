import BaseNode from './BaseNode';
import usePipelineStore from '../store';

export default function DedupeNode({ id, type, data }) {
  const update = usePipelineStore((s) => s.updateNodeData);
  return (
    <BaseNode id={id} type={type} data={data}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <label style={labelStyle}>Subset cols (blank = all)</label>
        <input
          placeholder="col1, col2 …"
          value={data.columns?.join(', ') ?? ''}
          onChange={(e) =>
            update(id, { columns: e.target.value ? e.target.value.split(',').map((c) => c.trim()) : [] })
          }
          onClick={(e) => e.stopPropagation()}
          style={inputStyle}
        />
        <label style={labelStyle}>Keep</label>
        <select
          value={data.keep ?? 'first'}
          onChange={(e) => update(id, { keep: e.target.value })}
          onClick={(e) => e.stopPropagation()}
          style={inputStyle}
        >
          <option value="first">First</option>
          <option value="last">Last</option>
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
